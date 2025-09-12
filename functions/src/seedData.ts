import * as admin from "firebase-admin";

// Firebase Admin SDK の初期化
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "engineer-guild-hackathon-c04cc"
  });
}

// エミュレータを使用する場合
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log("Using Firestore emulator");
}

const db = admin.firestore();

interface LearningRecord {
  userId: string;
  sessionId: string;
  subject: string;
  topic: string;
  summary: string;
  duration: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

async function seedSampleData() {
  try {
    const demoUserId = "demo-user-123";

    // サンプル学習記録データ
    const sampleRecords: Omit<LearningRecord, 'createdAt' | 'updatedAt'>[] = [
      {
        userId: demoUserId,
        sessionId: "session-1",
        subject: "数学",
        topic: "微分積分",
        summary: "微分と積分の基本概念を学習。導関数の求め方と積分の計算方法を理解した。",
        duration: 45,
        completedAt: new Date("2024-09-01T10:00:00Z"),
      },
      {
        userId: demoUserId,
        sessionId: "session-2",
        subject: "プログラミング",
        topic: "TypeScript",
        summary: "TypeScriptの型システムについて学習。インターフェースとジェネリクスの使い方を習得。",
        duration: 60,
        completedAt: new Date("2024-09-02T14:30:00Z"),
      },
      {
        userId: demoUserId,
        sessionId: "session-3",
        subject: "科学",
        topic: "物理学",
        summary: "ニュートンの運動法則を学習。力と運動の関係について理解を深めた。",
        duration: 30,
        completedAt: new Date("2024-09-03T09:15:00Z"),
      },
      {
        userId: demoUserId,
        sessionId: "session-4",
        subject: "歴史",
        topic: "世界史",
        summary: "第二次世界大戦の原因と経緯について学習。主要な出来事と影響を整理した。",
        duration: 40,
        completedAt: new Date("2024-09-04T16:45:00Z"),
      },
      {
        userId: demoUserId,
        sessionId: "session-5",
        subject: "英語",
        topic: "文法",
        summary: "英語の時制について学習。現在完了形と過去完了形の使い分けを練習した。",
        duration: 35,
        completedAt: new Date("2024-09-05T11:20:00Z"),
      },
      {
        userId: demoUserId,
        sessionId: "session-6",
        subject: "数学",
        topic: "線形代数",
        summary: "ベクトルと行列の基本操作を学習。行列の積と逆行列の求め方を理解した。",
        duration: 50,
        completedAt: new Date("2024-09-06T13:00:00Z"),
      },
      {
        userId: demoUserId,
        sessionId: "session-7",
        subject: "プログラミング",
        topic: "React",
        summary: "Reactのコンポーネントライフサイクルについて学習。フックの使い方を習得。",
        duration: 55,
        completedAt: new Date("2024-09-07T15:30:00Z"),
      },
      {
        userId: demoUserId,
        sessionId: "session-8",
        subject: "科学",
        topic: "化学",
        summary: "有機化学の基礎を学習。炭素化合物の構造と命名法について理解した。",
        duration: 45,
        completedAt: new Date("2024-09-08T10:45:00Z"),
      }
    ];

    console.log("サンプルデータを追加中...");

    // データをFirestoreに追加
    const batch = db.batch();
    for (const record of sampleRecords) {
      const docRef = db.collection('learningRecords').doc();
      batch.set(docRef, {
        ...record,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    console.log(`${sampleRecords.length}件のサンプル学習記録を追加しました。`);

    // 追加されたデータを確認
    const snapshot = await db.collection('learningRecords')
      .where('userId', '==', demoUserId)
      .get();

    console.log(`現在の学習記録数: ${snapshot.size}件`);

  } catch (error) {
    console.error("サンプルデータの追加に失敗しました:", error);
  }
}

// スクリプト実行
if (require.main === module) {
  seedSampleData()
    .then(() => {
      console.log("サンプルデータ追加完了");
      process.exit(0);
    })
    .catch((error) => {
      console.error("エラー:", error);
      process.exit(1);
    });
}

export { seedSampleData };
