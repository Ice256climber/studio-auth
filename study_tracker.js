// ==========================================================
// 共通設定
// ==========================================================
// 1. GASウェブアプリのURLを定数として設定 (一度だけ定義)
const WEB_APP_URL = 'あなたのデプロイURLをここに貼り付けます';

// ランキング表示用のコンテナ要素を定義 (DOM操作用)
const rankingContainer = document.getElementById('ranking-list');


// ==========================================================
// 機能A: 勉強時間データをGASへ送信 (POST)
// ==========================================================
/**
 * 勉強時間データをGASウェブアプリへ送信する関数
 * @param {string} studentId - 生徒のユニークID
 * @param {number} studyTimeMs - 記録したい勉強時間（ミリ秒）
 */
function sendStudyTime(studentId, studyTimeMs) {
    if (!studentId || studyTimeMs === undefined) {
        console.error('エラー: 生徒IDまたは勉強時間が未定義です。');
        return;
    }

    const formData = new FormData();
    formData.append('student_id', studentId);
    formData.append('study_time_ms', studyTimeMs);

    // fetch APIを使ってPOSTリクエストを送信
    fetch(WEB_APP_URL, {
        method: 'POST',
        body: formData 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('GASへの送信が失敗しました。ステータスコード: ' + response.status);
        }
        return response.text();
    })
    .then(data => {
        console.log('✅ データ記録成功:', data);
        // 記録成功後、ランキングを再読み込みしたい場合は、ここで displayRanking() を呼び出す
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
    // GETリクエストでデータを取得
    fetch(WEB_APP_URL) 
    .then(response => {
        if (!response.ok) {
            throw new Error('ランキングデータ取得失敗。ステータスコード: ' + response.status);
        }
        return response.json();
    })
    .then(rankingData => {
        console.log('ランキングデータ取得成功:', rankingData);

        // ランキングリストのHTMLを生成
        let htmlContent = '<h3>🏆 勉強時間ランキング</h3><ol>';

        rankingData.forEach((item, index) => {
            // item.total_minutes が「分」の値
            htmlContent += `<li>
                <span class="rank-number">#${index + 1}</span> 
                <span class="student-id">${item.student_id}</span> 
                <span class="time-minutes">${item.total_minutes} 分</span>
            </li>`;
        });

        htmlContent += '</ol>';

        // HTML要素に挿入
        if (rankingContainer) {
            rankingContainer.innerHTML = htmlContent;
        }

    })
    .catch(error => {
        console.error('❌ ランキング表示エラー:', error);
        if (rankingContainer) {
            rankingContainer.innerHTML = '<p>ランキングの読み込みに失敗しました。</p>';
        }
    });
}


// ==========================================================
// 機能C: 生徒IDの取得
// ==========================================================
/**
 * ローカルストレージに保存されているSupabaseセッションから、
 * 現在ログイン中の生徒のユニークID（user.id）を安全に取得する
 * @returns {string | null} 生徒ID、または取得できなかった場合はnull
 */
function getCurrentUserId() {
    try {
        const sessionData = localStorage.getItem('supabase_session_v2');
        if (!sessionData) return null;

        const session = JSON.parse(sessionData);

        // session.user.id に生徒IDが格納されている
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

// タイマーコード（pauseTimer）はこのファイルのどこかで getCurrentUserId() と sendStudyTime() を呼び出す想定です
