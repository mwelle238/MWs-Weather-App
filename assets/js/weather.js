var geoURL = 'http://api.openweathermap.org/geo/1.0/direct?q=';
var weatherURL = 'https://api.openweathermap.org/data/3.0/onecall?';
var city;
var APIkey = '&appid=5a2b8d33311dc86fb5608e194db81f27';
var lon;
var lat;
var state;
var country;
const iconURLprefix = 'http://openweathermap.org/img/wn/';
var resultsEl = $('#results');
var placeEL = $('#place');
var weatherCards = $('.weather-card');
var historyButtons = $('.search-history');
var searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
console.log(weatherCards);
console.log(placeEL);

function getForecast(){
    if(city){
    fetch(geoURL + city + "&limit=5" + APIkey)  // Search by city to get coordinates.
     .then(function (response) {
       return response.json();
     })
        .then(function (data) {
            if(data.length == 0){
                return;
            }
            saveSearch(city);
            lon = data[0].lon;
            lat = data[0].lat;
            city = data[0].name;
            state = data[0].state;
            country = data[0].country;
            placeEL[0].textContent = city + ", " + state + " " + country;
            resultsEl.first().removeClass('d-none'); 
            
            fetch(weatherURL + 'lat=' + lat + '&lon=' + lon + "&units=imperial&" + APIkey)  // takes longitude and latitude data from the city search to call the weather API
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                //console.log(data);

              for(let i=0; i<weatherCards.length; i++){
                weatherCards[i].children[1].children[0].attributes[1].nodeValue = iconURLprefix + data.daily[i].weather[0].icon + (i===0 ? '@2x.png' : '.png');
                weatherCards[i].children[1].children[1].children[0].textContent = data.daily[i].temp.max;
                weatherCards[i].children[1].children[1].children[2].textContent = data.daily[i].temp.min;
                weatherCards[i].children[1].children[1].children[4].textContent = data.daily[i].humidity;
                weatherCards[i].children[1].children[1].children[6].textContent = data.daily[i].weather[0].description;
                weatherCards[i].children[0].textContent = dayjs.unix(data.daily[i].sunrise).format('MMM D, YYYY');
              }    
            });
     })
    }
}
function saveSearch(search){
    search = search.charAt(0).toUpperCase() + search.slice(1).toLowerCase();
    if(!searchHistory) searchHistory = [];
    searchHistory.splice(0,0,search) //add new search to beginning
    for (let i=1; i<searchHistory.length; i++){
        if (search === searchHistory[i]){
            searchHistory.splice(i,1);
            break;
        }
    }
    while (searchHistory.length > 5){
        searchHistory.pop();
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    showHistory();
}

function showHistory(){
    if(!searchHistory) searchHistory = [];
    console.log(searchHistory);
    for (let i=0; i<searchHistory.length; i++ ){
      historyButtons[i].style.visibility = "visible";
      historyButtons[i].textContent = searchHistory[i];
    }
}

var cityFormEl = document.querySelector('#city-search');
var cityInputEl = document.querySelector('#city');

function formSubmitHandler(event) {
  event.preventDefault();

  city = cityInputEl.value.trim();

  if (city) {
    getForecast();
  }
};

function reloadHistory(event){
    event.preventDefault();
    city = this.textContent;
    getForecast();
}

$( document ).ready(() => {
    console.log("Webpage ready");
    showHistory();    
    cityFormEl.addEventListener('submit', formSubmitHandler);
    historyButtons.on("click", reloadHistory);
    
  })
