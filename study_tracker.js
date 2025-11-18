// ==========================================================
// 共通設定
// ==========================================================
// 1. GASウェブアプリのURLを定数として設定 (POST/GET共通)
const WEB_APP_URL = 'https://script.google.com/a/macros/gse.okayama-c.ed.jp/s/AKfycbyAUe8PwbhtiHEWpihT9ah2-77aybvprKDTtdENGzANEaE-nSHU-c6pQIkNWYyNDEgaww/exec'; 

// ランキング表示用のコンテナ要素を定義 (HTMLの <div id="ranking-list"> を参照)
const rankingContainer = document.getElementById('ranking-list');


// ==========================================================
// 機能A: 勉強時間データをGASへ送信 (POST)
// ==========================================================
/**
 * 勉強時間データをGASウェブアプリへ送信する関数
 */
function sendStudyTime(studentId, studyTimeMs) {
    if (!studentId || studyTimeMs === undefined) {
        console.error('エラー: 生徒IDまたは勉強時間が未定義です。');
        return;
    }

    const formData = new FormData();
    formData.append('student_id', studentId);
    formData.append('study_time_ms', studyTimeMs);

    fetch(WEB_APP_URL, {
        method: 'POST',
        body: formData 
    })
    .then(response => {
        // ... (省略: エラー処理) ...
        return response.text();
    })
    .then(data => {
        console.log('✅ データ記録成功:', data);
        // 記録成功後、ランキングを再読み込みしたい場合はここで呼び出す
        // displayRanking(); 
    })
    .catch(error => {
        console.error('❌ データ送信エラー:', error);
    });
}


// ==========================================================
// 機能B: ランキングデータをGASから取得・表示 (GET)
// ==========================================================
/**
 * GASからランキングデータを取得し、HTMLに表示する関数
 */
function displayRanking() {
    fetch(WEB_APP_URL) 
    .then(response => {
        // ... (省略: エラー処理) ...
        return response.json();
    })
    .then(rankingData => {
        let htmlContent = '<h3>🏆 勉強時間ランキング</h3><ol>';
        
        rankingData.forEach((item, index) => {
            htmlContent += `<li>
                <span class="rank-number">#${index + 1}</span> 
                <span class="student-id">${item.student_id}</span> 
                <span class="time-minutes">${item.total_minutes} 分</span>
            </li>`;
        });
        
        htmlContent += '</ol>';
        
        if (rankingContainer) {
            rankingContainer.innerHTML = htmlContent;
        }

    })
    .catch(error => {
        if (rankingContainer) {
            rankingContainer.innerHTML = '<p>ランキングの読み込みに失敗しました。</p>';
        }
    });
}


// ==========================================================
// 機能C: 生徒IDの取得（Supabaseから）
// ==========================================================
/**
 * ローカルストレージに保存されているSupabaseセッションから、生徒IDを取得
 */
function getCurrentUserId() {
    try {
        const sessionData = localStorage.getItem('supabase_session_v2');
        if (!sessionData) return null;
        
        const session = JSON.parse(sessionData);
        return session?.user?.id || null;
        
    } catch (e) {
        console.error("Supabaseセッションから生徒IDの取得に失敗しました:", e);
        return null;
    }
}


// ==========================================================
// 実行トリガー
// ==========================================================
// ページ読み込み完了後にランキングを表示する
document.addEventListener('DOMContentLoaded', displayRanking);
