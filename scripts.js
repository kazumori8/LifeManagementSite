window.onload = function() {
    getWeather();
    setDate();
};
function setDate() {
    // 現在の日付を取得
    let today = new Date();
    let day = String(today.getDate()).padStart(2, '0');
    let month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
    let year = today.getFullYear();

    today = year + '年' + month + '月' + day + '日';
    document.getElementById('today-weather-header').textContent = today + "の天気";
}
async function getWeather() {
    try {
        // OpenWeatherMapのOne Call APIからデータを取得
        const response = await fetch('https://api.openweathermap.org/data/2.5/onecall?lat=34.7320499&lon=135.7336346&units=metric&exclude=current,minutely,daily,alerts&appid=a3dfe4d9f6480e3c5705172e6a5a2027');
        const data = await response.json();
        // 今日の日付を取得
        let today = new Date();
        let hours = today.getHours();


        // 次の9時、13時、17時までの時間を計算
        let next9 = (hours >= 9) ? (33 - hours) : (9 - hours);
        let next13 = (hours >= 13) ? (37 - hours) : (13 - hours);
        let next17 = (hours >= 17) ? (41 - hours) : (17 - hours);
        if (data.hourly[next9].weather[0].main === "Clouds") {
            motiko_clouds_say();
        }

           // 指定した時間の天気と気温を取得して表示
    let morningWeather = data.hourly[next9].weather[0].main;
    document.getElementById('morning-weather-text').innerHTML = "午前9時の天気: " + morningWeather;
    document.getElementById('morning-img').src = getImageForWeather(morningWeather);
    document.getElementById('morning-weather-temp').innerHTML = "気温: " + data.hourly[next9].temp + "°C";
    
    let afternoonWeather = data.hourly[next13].weather[0].main;
    document.getElementById('afternoon-weather-text').innerHTML = "午後1時の天気: " + afternoonWeather;
    document.getElementById('afternoon-img').src = getImageForWeather(afternoonWeather);
    document.getElementById('afternoon-weather-temp').innerHTML = "気温: " + data.hourly[next13].temp + "°C";

    let eveningWeather = data.hourly[next17].weather[0].main;
    document.getElementById('evening-weather-text').innerHTML = "午後5時の天気: " + eveningWeather;
    document.getElementById('evening-img').src = getImageForWeather(eveningWeather);
    document.getElementById('evening-weather-temp').innerHTML = "気温: " + data.hourly[next17].temp + "°C";

        // 48時間の天気予報をチェックして洗濯の判断
        let isLaundryDay = true;
        for (let i = 0; i < 24; i++) {
            if (data.hourly[i].weather[0].main === "Rain") {
                isLaundryDay = false;
                break;
            }
        }

        // 洗濯の判断を表示
        if (isLaundryDay) {
            document.getElementById('laundry').innerHTML = "洗濯の判断: 今日は洗濯に適しています。";
            document.getElementById('laundry-img').src = "washing-machine.png"; // 洗濯が可能なときは洗濯機の画像を表示
        } else {
            document.getElementById('laundry').innerHTML = "洗濯の判断: 今日は洗濯を避けてください。";
            document.getElementById('laundry-img').src = "umbrella.png"; // 洗濯が難しいときは傘の画像を表示
        }

    } catch (error) {
        // エラーハンドリング: データの取得に失敗した場合
        alert('天気データの取得に失敗しました。' + error);
    }
}
function getImageForWeather(weather) {
    switch (weather) {
        case 'Rain':
            return 'rain.png'; // 雨の天気を表す画像のURLを設定
        case 'Clouds':
            return 'clouds.png'; // 曇りの天気を表す画像のURLを設定
        case 'Clear':
            return 'clear.png'; // 晴れの天気を表す画像のURLを設定
        default:
            return 'default.png'; // その他の天気を表す画像のURLを設定
    }
}

// ブザーの音を鳴らす
function motiko_clouds_say() {
    document.getElementById('motiko_clouds').play();
}
// ブザーの音を鳴らす
function buzz_first() {
    document.getElementById('buzzer_first').play();
}
function buzz_end() {
    document.getElementById('buzzer_end').play();
}

// ポモドーロタイマー
let countdown;
function startPomodoro() {
    clearInterval(countdown); // 既存のタイマーをクリア
    const now = Date.now();
    const then = now + 25 * 60 * 1000; // 25分後

    buzz_first();
    countdown = setInterval(() => {
        const secondsLeft = Math.round((then - Date.now()) / 1000);

        // タイマーが0になったら休憩時間を開始
        if (secondsLeft < 0) {
            clearInterval(countdown);
            startBreak();
            return;
        }

        // 残り時間を表示
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        document.getElementById('pomodoro-timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
}

// 休憩時間
function startBreak() {
    const now = Date.now();
    const then = now + 5 * 60 * 1000; // 5分後
    buzz_end();
    countdown = setInterval(() => {
        const secondsLeft = Math.round((then - Date.now()) / 1000);

        // タイマーが0になったら作業時間を再開
        if (secondsLeft < 0) {
            clearInterval(countdown);
            startPomodoro();
            return;
        }

        // 残り時間を表示
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        document.getElementById('pomodoro-timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
}
function stopPomodoro() {
    clearInterval(countdown); // タイマーをクリア
}

// ポモドーロタイマーのリセット
function resetPomodoro() {
    buzz_end();
    clearInterval(countdown); // タイマーをクリア
    document.getElementById('pomodoro-timer').textContent = '25:00'; // 時間を初期値に戻す
}