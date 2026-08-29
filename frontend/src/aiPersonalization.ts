import * as tf from '@tensorflow/tfjs';
import { db, UserStats, QuizSubmission, SkillProgress } from './db';

const MODEL_URI = 'localstorage://edumesh-adaptive-model';

/**
 * AI Personalization Engine (Offline First)
 * Uses TensorFlow.js to predict the optimal difficulty level and recommend actions
 * based on a student's historical performance, XP, and streaks.
 */
class AdaptiveLearningEngine {
    private model: tf.LayersModel | tf.Sequential | null = null;
    private isReady = false;

    async initialize() {
        if (this.isReady) return;

        try {
            // Try loading existing model from IndexedDB/LocalStorage
            this.model = await tf.loadLayersModel(MODEL_URI);
            console.log('🧠 AI Adaptive Model Loaded from Cache');
        } catch (e) {
            // Build a new lightweight sequential model if none exists
            console.log('🧠 Building new AI Adaptive Model...');
            const newModel = tf.sequential();

            // Input: [XP_normalized, Level, Streak, AvgScore, MasteryCount]
            newModel.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [5] }));
            newModel.add(tf.layers.dropout({ rate: 0.2 }));
            newModel.add(tf.layers.dense({ units: 8, activation: 'relu' }));

            // Output: [Recommended_Difficulty_Multiplier (0 to 1), At_Risk_Probability (0 to 1)]
            newModel.add(tf.layers.dense({ units: 2, activation: 'sigmoid' }));

            newModel.compile({
                optimizer: tf.train.adam(0.01),
                loss: 'meanSquaredError',
                metrics: ['accuracy']
            });

            await newModel.save(MODEL_URI);
            this.model = newModel;
        }
        this.isReady = true;
    }

    /**
     * Extracts features for the model based on the student's current local database state.
     */
    private async extractFeatures(studentId: number): Promise<number[]> {
        const stats: UserStats | undefined = await db.user_stats.get(studentId.toString());
        const submissions = await db.quiz_submissions.where('student_id').equals(studentId).toArray();
        const progress = await db.skill_progress.where('student_id').equals(studentId).toArray();

        // 1. Normalized XP (cap at 10,000 for normalization)
        const normXP = Math.min((stats?.xp || 0) / 10000, 1.0);

        // 2. Normalized Level (cap at 20)
        const normLevel = Math.min((stats?.level || 1) / 20, 1.0);

        // 3. Normalized Streak (cap at 30 days)
        const normStreak = Math.min((stats?.streak || 0) / 30, 1.0);

        // 4. Average Score over last 10 quizzes (0.0 to 1.0)
        let avgScore = 0.5; // Default middle ground
        if (submissions.length > 0) {
            const recent = submissions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
            const totalScore = recent.reduce((sum, sub) => sum + sub.score, 0);
            // Assuming max score is usually represented out of 100 for this metric simplification
            avgScore = (totalScore / recent.length) / 100;
            if (avgScore > 1) avgScore = 1; // Cap just in case
        }

        // 5. Mastery Count (nodes >= 80% / 50 nodes expected max)
        const masteries = progress.filter(p => p.mastery_pct >= 80).length;
        const normMastery = Math.min(masteries / 50, 1.0);

        return [normXP, normLevel, normStreak, avgScore, normMastery];
    }

    /**
     * Re-trains the model slightly in the background based on a new quiz result.
     * This makes the model 'adaptive' to the specific user over time.
     */
    async fineTune(studentId: number, latestScore: number) {
        if (!this.isReady || !this.model) await this.initialize();

        const features = await this.extractFeatures(studentId);
        const xs = tf.tensor2d([features]);

        // Concept: If score is high (>80), target difficulty should be higher (e.g. 0.8)
        // If score is low (<50), target difficulty should drop, and at-risk probability goes up.
        const normScore = latestScore / 100;
        const targetDifficulty = normScore > 0.8 ? 0.9 : normScore > 0.5 ? 0.6 : 0.3;
        const atRiskProb = normScore < 0.4 ? 0.8 : normScore < 0.6 ? 0.4 : 0.1;

        const ys = tf.tensor2d([[targetDifficulty, atRiskProb]]);

        const layersModel = this.model as tf.LayersModel;
        await layersModel.fit(xs, ys, { epochs: 3, verbose: 0 });
        await layersModel.save(MODEL_URI);

        xs.dispose();
        ys.dispose();
    }

    /**
     * Get personalized recommendations for the dashboard.
     */
    async getInsights(studentId: number) {
        if (!this.isReady || !this.model) await this.initialize();

        const features = await this.extractFeatures(studentId);
        const xs = tf.tensor2d([features]);

        const prediction = this.model!.predict(xs) as tf.Tensor;
        const [difficulty, risk] = Array.from(prediction.dataSync());

        xs.dispose();
        prediction.dispose();

        let recommendationMessage = 'Keep up the steady progress!';
        let actionColor = 'text-blue-500';

        if (risk > 0.6) {
            recommendationMessage = 'Content seems tough right now. Try reviewing earlier lessons.';
            actionColor = 'text-rose-500';
        } else if (difficulty > 0.7) {
            recommendationMessage = 'You are crushing it! Try a Challenge Node next.';
            actionColor = 'text-emerald-500';
        }

        return {
            difficultyRange: difficulty,
            atRiskProbability: risk,
            message: recommendationMessage,
            color: actionColor
        };
    }
}

export const aiEngine = new AdaptiveLearningEngine();
