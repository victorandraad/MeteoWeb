const getWeatherButton = document.getElementById('getWeather');
const weatherInfoDiv = document.getElementById('weatherInfo');
const forecastTable = document.getElementById('forecastTable');
const cityInput = document.getElementById('city');

// Indicador de carregamento
function showLoading() {
    weatherInfoDiv.innerHTML = `<p style="color: blue;">Buscando dados...</p>`;
}

// Função para obter descrição da temperatura
function getTemperatureDescription(temp) {
    return temp <= 10 ? "Frio ❄️" : temp >= 25 ? "Quente 🔥" : "Moderado 🌤️";
}

// Função para obter descrição do vento
function getWindDescription(speed) {
    return speed < 10 ? "Brisa leve 🌬️" : speed < 25 ? "Vento moderado 💨" : "Vento forte 🌪️";
}

// Função para converter data em dia da semana
function getWeekday(dateString) {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const date = new Date(dateString);
    return days[date.getDay()];
}

// Função para buscar dados meteorológicos
async function fetchWeather(city) {
    try {
        showLoading();
        
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
        const locationData = await geoResponse.json();

        if (!locationData.results || locationData.results.length === 0) {
            weatherInfoDiv.innerHTML = `<p style="color: red;">Cidade não encontrada, tente outra!</p>`;
            return;
        }

        const { latitude, longitude, name } = locationData.results[0];

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max&timezone=auto`);
        const weatherData = await weatherResponse.json();

        const temperature = weatherData.current_weather?.temperature || "Não disponível";
        const windSpeed = weatherData.daily?.wind_speed_10m_max?.[0] || "Não disponível";
        const precipitationProbability = weatherData.daily?.precipitation_probability_max?.[0] || "Não disponível";

        weatherInfoDiv.innerHTML = `
            <p><strong>Cidade:</strong> ${name}</p>
            <p><strong>Temperatura:</strong> ${temperature}°C - ${getTemperatureDescription(temperature)}</p>
            <p><strong>Velocidade do Vento:</strong> ${windSpeed} km/h - ${getWindDescription(windSpeed)}</p>
            <p><strong>Probabilidade de Chuva:</strong> ${precipitationProbability}% 🌧️</p>
        `;

        displayForecast(weatherData.daily);
    } catch (error) {
        weatherInfoDiv.innerHTML = `<p style="color: red;">Erro ao buscar dados meteorológicos.</p>`;
    }
}

// Função para exibir previsão semanal com animação e dia da semana
function displayForecast(dailyData) {
    forecastTable.innerHTML = ""; // Limpa antes de adicionar novos dados
    
    dailyData.time.forEach((date, index) => {
        const dayBox = document.createElement("div");
        dayBox.className = "day-box";
        dayBox.style.opacity = "0"; // Inicialmente invisível
        
        dayBox.innerHTML = `
            <p><strong>${getWeekday(date)}</strong></p>
            <p>🌡️ ${dailyData.temperature_2m_min[index]}°C - ${dailyData.temperature_2m_max[index]}°C</p>
            <p>💨 Vento: ${dailyData.wind_speed_10m_max[index]} km/h</p>
            <p>🌧️ Chuva: ${dailyData.precipitation_probability_max[index]}%</p>
        `;

        forecastTable.appendChild(dayBox);

        setTimeout(() => { dayBox.style.opacity = "1"; }, index * 200); // Animação gradual
    });
}

// Evento de clique no botão para buscar previsão
getWeatherButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        weatherInfoDiv.innerHTML = `<p style="color: red;">Digite o nome da cidade!</p>`;
    }
});

function displayForecast(dailyData) {
    const forecastTitle = document.getElementById("forecastTitle");
    forecastTitle.style.display = "block"; // Exibe o título da previsão

    forecastTable.innerHTML = ""; // Limpa antes de adicionar novos dados

    dailyData.time.forEach((date, index) => {
        const dayBox = document.createElement("div");
        dayBox.className = "day-box";
        dayBox.style.opacity = "0"; // Inicialmente invisível
        
        dayBox.innerHTML = `
            <p><strong>${getWeekday(date)}</strong></p>
            <p>🌡️ ${dailyData.temperature_2m_min[index]}°C - ${dailyData.temperature_2m_max[index]}°C</p>
            <p>💨 Vento: ${dailyData.wind_speed_10m_max[index]} km/h</p>
            <p>🌧️ Chuva: ${dailyData.precipitation_probability_max[index]}%</p>
        `;

        forecastTable.appendChild(dayBox);

        setTimeout(() => { dayBox.style.opacity = "1"; }, index * 200); // Animação gradual
    });
}

const cities = [
    { name: "Paris", latitude: 48.8566, longitude: 2.3522 },
    { name: "New York", latitude: 40.7128, longitude: -74.0060 },
    { name: "Tokyo", latitude: 35.6895, longitude: 139.6917 }
];

const apiBaseUrl = "https://api.open-meteo.com/v1/forecast";

async function fetchWeatherData(latitude, longitude) {
    const response = await fetch(`${apiBaseUrl}?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    const data = await response.json();
    return data.current_weather.temperature;
}

async function displayWeatherData() {
    for (let i = 0; i < cities.length; i++) {
        const { name, latitude, longitude } = cities[i];
        const temperature = await fetchWeatherData(latitude, longitude);
        const weatherDiv = document.getElementById(`weather${i + 1}`);
        weatherDiv.innerHTML = `<strong>${name}:</strong> ${temperature}°C`;
    }
}

document.getElementById("getWeather").addEventListener("click", displayWeatherData);
displayWeatherData();

const messages = [
    "Bem-vindo!",
    "Cuidado com avisos de tempestade...",
    "Fique ligado na previsão!"
];

const messageBox = document.getElementById("message-box");

function showMessage(index = 0) {
    if (index >= messages.length) {
        messageBox.innerHTML = ""; // Limpa o texto após exibir todas as mensagens
        return;
    }

    let message = messages[index];
    let i = 0;

    // Efeito de digitação
    const typingInterval = setInterval(() => {
        if (i < message.length) {
            messageBox.innerHTML += message[i];
            i++;
        } else {
            clearInterval(typingInterval);

            // Remove mensagem após 2 segundos
            setTimeout(() => {
                messageBox.innerHTML = ""; // Limpa mensagem atual
                showMessage(index + 1); // Exibe próxima mensagem
            }, 2000);
        }
    }, 100); // Intervalo entre os caracteres
}

showMessage(); // Inicia exibição das mensagens













