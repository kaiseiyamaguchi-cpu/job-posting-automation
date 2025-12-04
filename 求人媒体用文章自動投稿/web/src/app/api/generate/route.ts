import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { masterData } = await request.json();

    if (!masterData || !masterData.companyName || !masterData.jobTitle) {
      return NextResponse.json(
        { error: "会社名と職種名は必須です" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `あなたは求人原稿のプロライターです。以下のマスターデータを元に、3つの求人媒体（Indeed、エンゲージ、求人ボックス）向けの原稿を生成してください。

【マスターデータ】
会社名: ${masterData.companyName}
事業内容: ${masterData.businessDescription || "未記入"}
職種名: ${masterData.jobTitle}
職種カテゴリ: ${masterData.jobCategory || "未選択"}
雇用形態: ${masterData.employmentType}
募集人数: ${masterData.recruitmentCount || "若干名"}
給与: ${masterData.salaryType}${masterData.salaryMin}${masterData.salaryMax ? `〜${masterData.salaryMax}` : ""}${masterData.salaryType === "時給" ? "円" : "万円"}
賞与・手当: ${masterData.bonus || "未記入"}
勤務地: ${masterData.location || "未記入"}
最寄り駅: ${masterData.nearestStation || "未記入"}
勤務時間: ${masterData.workHours || "未記入"}
休日・休暇: ${masterData.holidays || "未記入"}
待遇・福利厚生: ${masterData.benefits || "未記入"}
仕事内容: ${masterData.jobDescription || "未記入"}
仕事の特徴: ${masterData.jobFeatures || "未記入"}

【媒体別ペルソナ】
Indeed向け: ${masterData.personaIndeed || "一般的な求職者"}
エンゲージ向け: ${masterData.personaEngage || "一般的な求職者"}
求人ボックス向け: ${masterData.personaKyujinbox || "一般的な求職者"}

【各媒体の特性】
1. Indeed: 検索エンジン型。具体的なキーワード（スキル、経験年数、資格）を含める。実務的・端的な表現。
2. エンゲージ: 人柄・カルチャーフィット重視。会社の雰囲気や人間関係を伝える。親しみやすい表現。
3. 求人ボックス: 幅広い層にリーチ。未経験歓迎など間口を広げる表現。訴求力のあるキャッチーな表現。

【文章作成ルール】
- 読点（、）を多用しない。1文に2つまで
- 「！」は使わない
- 箇条書きの記号は「・」「-」どちらかに統一
- 「～」は「〜」に統一
- 具体的な数字を積極的に使用（○年以上、○名体制、○%など）
- 誇張表現を避け、事実に基づく内容にする

【出力形式】
以下のJSON形式で出力してください。各フィールドは改行を含まない単一行の文字列にしてください。

{
  "indeed": {
    "jobTitle": "職種名/タイトル",
    "jobDescription": "仕事内容（具体的な業務内容を詳細に）",
    "appealPoints": "アピールポイント",
    "targetPerson": "求める人材（スキル・経験を具体的に）",
    "requirements": "応募資格・必須条件",
    "salary": "給与詳細",
    "benefits": "待遇・福利厚生",
    "workConditions": "勤務条件（時間・休日）",
    "other": "その他・特記事項"
  },
  "engage": {
    "jobTitle": "職種名/タイトル",
    "jobDescription": "仕事内容（会社の雰囲気が伝わるように）",
    "appealPoints": "アピールポイント・やりがい",
    "targetPerson": "求める人材（人柄・マインドセット重視）",
    "requirements": "応募資格",
    "salary": "給与詳細",
    "benefits": "待遇・福利厚生",
    "workConditions": "勤務条件（時間・休日）",
    "other": "その他・特記事項"
  },
  "kyujinbox": {
    "jobTitle": "求人タイトル（キャッチーに）",
    "jobDescription": "仕事内容",
    "appealPoints": "この仕事のやりがい",
    "targetPerson": "対象となる方（間口を広げる表現）",
    "requirements": "応募資格",
    "salary": "給与詳細",
    "benefits": "待遇・福利厚生",
    "workConditions": "勤務条件（時間・休日）",
    "other": "その他・特記事項"
  }
}

JSONのみを出力し、それ以外のテキストは含めないでください。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSONを抽出
    let jsonText = text;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else {
      const plainJsonMatch = text.match(/\{[\s\S]*\}/);
      if (plainJsonMatch) {
        jsonText = plainJsonMatch[0];
      }
    }

    const data = JSON.parse(jsonText);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("生成中にエラーが発生しました:", error);
    return NextResponse.json(
      { error: `生成中にエラーが発生しました: ${error}` },
      { status: 500 }
    );
  }
}
