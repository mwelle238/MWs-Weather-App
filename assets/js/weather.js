var geoURL = 'https://api.openweathermap.org/geo/1.0/direct?q=';
var weatherURL = 'https://api.openweathermap.org/data/3.0/onecall?';
var city;
var APIkey = '&appid=5a2b8d33311dc86fb5608e194db81f27';
var lon;
var lat;
var state;
var country;
const iconURLprefix = 'https://openweathermap.org/img/wn/';
var resultsEl = $('#results');
var instructionEl = $('#instruction');
var placeEL = $('#place');
var weatherCards = $('.weather-card');
var historyButtons = $('.search-history');
var searchHistory = JSON.parse(localStorage.getItem('searchHistory'));

function getForecast(){
    if(city){
    fetch(geoURL + city + "&limit=1" + APIkey)  // Search by city to get coordinates.
     .then(function (response) {
       return response.json();
     })
        .then(function (data) {
            if(data.length == 0){  // if API doesn't return anything, do nothing
                return;
            }
            saveSearch(city);  //add to search history
            lon = data[0].lon;
            lat = data[0].lat;
            city = data[0].name;
            state = data[0].state;
            country = data[0].country;
            placeEL[0].textContent = city + ", " + state + " " + country;
            instructionEl.first().addClass('d-none'); // hide instructions
            resultsEl.first().removeClass('d-none'); // display weather results
            
            
            fetch(weatherURL + 'lat=' + lat + '&lon=' + lon + "&units=imperial&" + APIkey)  // takes longitude and latitude data from the city search to call the weather API
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                //console.log(data);
              for(let i=0; i<weatherCards.length; i++){
                // get wind speed and direction
                let windInfo = data.daily[i].wind_speed;
                switch (Math.floor((data.daily[i].wind_deg+23)/45)) {
                  case 0: case 8: windInfo += ' N'; break;
                  case 1: windInfo += ' NE'; break;
                  case 2: windInfo += ' E'; break;
                  case 3: windInfo += ' SE'; break;
                  case 4: windInfo += ' S'; break;
                  case 5: windInfo += ' SW'; break;
                  case 6: windInfo += ' W'; break;
                  case 7: windInfo += ' NW'; break;
                  default:
                }
                // display weather info on the cards
                weatherCards[i].children[1].children[0].attributes[1].nodeValue = iconURLprefix + data.daily[i].weather[0].icon + '.png';
                weatherCards[i].children[1].children[1].children[0].textContent = data.daily[i].temp.max;
                weatherCards[i].children[1].children[1].children[2].textContent = data.daily[i].temp.min;
                weatherCards[i].children[1].children[1].children[4].textContent = data.daily[i].humidity;
                weatherCards[i].children[1].children[1].children[6].textContent = windInfo;
                weatherCards[i].children[1].children[1].children[8].textContent = data.daily[i].weather[0].description;
                weatherCards[i].children[0].textContent = dayjs.unix(data.daily[i].sunrise).format('MMM D, YYYY');
              }    
            });
     })
    }
}

// update the search history with the new search and save it to localStorage
function saveSearch(search){
    search = search.charAt(0).toUpperCase() + search.slice(1).toLowerCase();
    if(!searchHistory) searchHistory = [];  //make sure searchHistory is defined
    searchHistory.splice(0,0,search) //add new search to beginning
    for (let i=1; i<searchHistory.length; i++){
        if (search === searchHistory[i]){
            searchHistory.splice(i,1); // if a search button was pressed, would show up twice in history, so remove old one
            break;
        }
    }
    while (searchHistory.length > 8){
        searchHistory.pop();  // only hold 8 most recent searches
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory)); 
    showHistory();
}

// search history buttons only show if they exist
function showHistory(){
    if(!searchHistory) searchHistory = [];  
   //console.log(searchHistory);
    for (let i=0; i<searchHistory.length; i++ ){
      historyButtons[i].style.visibility = "visible";
      historyButtons[i].textContent = searchHistory[i];
    }
}

var cityFormEl = document.querySelector('#city-search');
var cityInputEl = document.querySelector('#city');

// weather button clicked
function formSubmitHandler(event) {
  event.preventDefault();

  city = cityInputEl.value.trim();

  if (city) {
    getForecast();
  }
};

// search history button pressed 
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
