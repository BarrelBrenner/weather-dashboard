//This command compiles previously searched locations
rewindPreviousLocation();

//This function gives current day & time when you search for a location
function getDate() {
  return moment().format("MMMM Do YYYY, h:mm:ss a");
}

//This const lists my API Key from which to pull data
const apiKey = "513558c8e04c7ce19dc87e69d4a6c2ab";

//When you click on search button, displays time, location, & other data to base decisions for various reasons such as comparisons, planning, etc.
$("#weather-button").on("click", function () {
  let location = $("#city-search").val().trim().toUpperCase();
  console.log(location);
  
  let symbol = $("<img>").attr("id", "icon");
  $("#currentDay").empty();
  $("#currentDay").append(`${location} (${getDate()})`);
  $("#currentDay").append(symbol);
  
  getMeteor(location);
  getPrognostication(location);
  retainPlace(location);
  rewindPreviousLocation();
});

//This function retrieves data from api for current weather using APIKey
function getMeteor(location) {
  console.log(location);
  $.ajax({
    url:"https://api.openweathermap.org/data/2.5/weather?q=" + location + "&units=imperial&appid=" + apiKey,
    method: "GET",
  }).then(function (result) {
    console.log(result);
    
    $("#temperature").text(result.main.temp + "F");
    $("#humidity").text(result.main.humidity);
    $("#windSpeed").text(result.wind.speed);
    
    let img = $("#icon").attr("src", "https://openweathermap.org/img/w/" + result.weather[0].icon + ".png");
    let lat = result.coord.lat;
    let lon = result.coord.lon;
    console.log(lat, lon);
    getRay(lat, lon);
  });
}

//This function retrieves UV (UltraViolet) Ray data for current weather using APIKey
function getRay(lat, lon) {
  $.ajax({
    url:"https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey,
    method: "GET",
  }).then(function (result) {
    let ultraVioletIndex = result.value;
    console.log(ultraVioletIndex);
    
    $("#uvIndex").text(ultraVioletIndex);
    if ((ultraVioletIndex > 0) & (ultraVioletIndex <= 2.99)) {
      $("#uvIndex").css("color", "green");
    } else if ((ultraVioletIndex > 3) & (ultraVioletIndex <= 5.99)) {
      $("#uvIndex").css("color", "yellow");
    } else if ((ultraVioletIndex > 6) & (ultraVioletIndex <= 7.99)) {
      $("#uvIndex").css("color", "orange");
    } else if ((ultraVioletIndex > 8) & (ultraVioletIndex <= 10.99)) {
      $("#uvIndex").css("color", "red");
    } else {
      $("#uvIndex").css("color", "purple");
    }
    $(".currentWeather-section").removeClass("hidden");
  });
}

// This function displays 5 day forecast of searched location using APIKey
function getPrognostication(location) {
  $.ajax({
    url:"https://api.openweathermap.org/data/2.5/forecast?q=" + location + "&units=imperial&cnt=5&appid=" + apiKey,
    method: "GET",
  }).then(function (result) {
    console.log(result);
    
    $(".forecastWeather-section").empty();
    result.list.forEach(function (day, index) {
      console.log(index);
      console.log(day.main.temp);
      console.log(day.main.humidity);
      console.log(day.wind.speed);
      console.log(day.pop);
      
      let container = $("<div>");
      container.addClass("col");
      container.addClass("day");
      
      let selectDate = $("<strong>").text(moment().add(index + 1, "days").format("MMM Do YY"));
      container.append(selectDate);
      
      let skyIcon = $("<img>").attr("src", "https://openweathermap.org/img/w/" + day.weather[0].icon + ".png");
      container.append(skyIcon);
      
      let predictionTemp = $("<p>")
        .text("Temp: " + day.main.temp + "F")
        .addClass("temperature");
      container.append(predictionTemp);
      
      let predictionHumid = $("<p>")
        .text("Humid: " + day.main.humidity)
        .addClass("humidity");
      container.append(predictionHumid);

      let predictionWindSpeed = $("<p>")
        .text("Wind: " + day.wind.speed + "MPH")
        .addClass("windSpeed");
      container.append(predictionWindSpeed);

      let predictionChance = $("<p>")
        .text("Chance: " + day.pop + "%")
        .addClass("precipitation");
      container.append(predictionChance);
      
      $(".forecastWeather-section").append(container);
    });
    $(".forecastWeather-section").removeClass("hidden");
  });
}

//This function saves previous locations into local storage
function retainPlace(location) {
  let data = findLocation();
  if (!data.cities) {
    data.cities = [];
  }

//This if statement checks for results that have already been searched
  if (data.cities.includes(location)) {
    let i = data.cities.indexOf(location);
    data.cities.splice(i, 1);
  }

  data.cities.unshift(location);
  localStorage.setItem("searchedCity", JSON.stringify(data));
}

//This function retrieves location(s) in question from local storage
function findLocation() {
  let data = localStorage.getItem("searchedCity");
  if (data) {
    return JSON.parse(data);
  } else {
    return {};
  }
}

//This function retrieves searched location history, user can then select location by clicking on it from history to display data with APIKey credentials 
function rewindPreviousLocation() {
  let data = findLocation();
  $("#citiesSearched").empty();
  if (data.cities) {
    data.cities.forEach(function (location) {
      let container = $("<div>");
      container.text(location);
      container.on("click", function (event) {
        $("#city-search").val(event.target.innerText);
        $("#weather-button").click();
      });
      $("#citiesSearched").append(container);
    });
  }
}