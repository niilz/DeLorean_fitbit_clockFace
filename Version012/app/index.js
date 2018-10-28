import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";
import { battery } from "power";
import { display } from "display";
import { units } from "user-settings";
import * as util from "../common/utils";

// Update the clock every minute
clock.granularity = "minutes";

// ######## DATE-PANEL #########
// select date Elements with helper-function below
const MONTH = document.getElementById("month"); // month won't be digital PNGs
const DAY = getEls("day", 2);
const YEAR = getEls("year", 4);
const HOUR = getEls("hour", 2);
const MIN = getEls("minute", 2);
//const SEC = getEl("second", 2);

let stepsThisHour = 0;
const stepsOffset = today.adjusted.steps;

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
// const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// Update the <image> tags for Hours, minutes every tick with the current time
clock.ontick = () => {
  const now = new Date();
  
  // get data for date (panel 1)
  const month = [now.getMonth()]; // month will just be text
  const day = util.zeroPad(now.getDate(), 2).split('');
  const year = now.getFullYear().toString().split(''); // year needs no Zero-Padding
  const hour = util.zeroPad(now.getHours(), 2).split('');
  const min = util.zeroPad(now.getMinutes(), 2).split('');
 // let sec = util.zeroPad(today.getSeconds()).split('');
  
  // display date-data
  MONTH.text = months[month];
  addDigits(DAY, day);
  addDigits(YEAR, year);
  addDigits(HOUR, hour);
  addDigits(MIN, min);
  //ddDigits(SEC, sec);
  
  // update steps this hour
  if (now.getMinutes() === 0) stepsThisHour = 0;
  stepsThisHour = today.adjusted.steps - stepsOffset;
}

// ####### ACTIVITY-PANEL ########
// select activity-SVG-elements with helper-function below
const CAL = getEls("cal", 5);
const FLOOR = getEls("floor", 4);
const STEP = getEls("step", 5);


// ####### STATS-PANEL #######
// select stats-SVT-elements
const HOUR_STEPS = getEls("hourSteps", 3);
const BATTERY = getEls("battery", 2);
const DISTANCE = getEls("distance", 3);
const HEART = getEls("heart", 3);

// gets fired on every display-change (if display is on)
function displayActivity() {
  // get activity-data (panel 2)
  const activities = today.local;
  const cals = util.zeroPad(activities.calories, 5).split('');
  const floors = util.zeroPad(activities.elevationGain, 4).split('');
  const steps = util.zeroPad(today.adjusted.steps, 5).split('');
  
  // get stats-data (panel 3) (apart from heartRate)
  const hourSteps = util.zeroPad(stepsThisHour, 3).split('');
  const bat = util.zeroPad(Math.floor(battery.chargeLevel), 2).split(''); // cannot be called battery
  const distanceInMeters = activities.distance;
  const distance = util.zeroPad(Math.floor(distanceInMeters / 100), 3).split('');
  
  // display activity-data (panel 2)
  addDigits(CAL, cals);
  addDigits(FLOOR, floors);
  addDigits(STEP, steps);
  // display stats-data (panel 3)
  addDigits(HOUR_STEPS, hourSteps);
  addDigits(BATTERY, bat);
  addDigits(DISTANCE, distance);
}


// get and display hear-rate
const heartRate = "000";

const hr = new HeartRateSensor();
hr.onreading = () => {
  // get heartRate on change of heartRate
  heartRate = util.zeroPad(hr.heartRate, 3).split('');
  // render the HeartRate (seperate from the other numbers)
  addDigits(HEART, heartRate);
}
// initialize heartRateReader
hr.start();


// ###### DISPLAY #######
// handle display, if display is on
display.onchange = () => {
  if (display.on) {
    hr.start();
    displayActivity();
  } else {
    hr.stop();
  }
    
}
// initialize first display of all activities
displayActivity();


// ##### HELPER-FUNCTIONS #####

// getElement-helper-function
function getEls(klass, range) {
  const list = [];
  for (let i = 1; i <= range; i++) {
    let el = document.getElementById(`${klass}${i}`);
    list.push(el);
  }
  return list;
}

// get PNG from resources for displaying it (helper-function)
function addDigits(els, nums) {
  if (els.length != nums.length) {
    console.log("number of data elements unequal to elements to render");
  } else {
    els.forEach((el, i) => el.href = `${nums[i]}.png`);
  }
}