// version 1.0.1

import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";
import { battery } from "power";
import { display } from "display";
import { units } from "user-settings";
import * as util from "../common/utils";
import * as fs from "fs";

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

// HANDLE STEPS PER HOUR VALUES
// innitial values
let stepsData = {
  stepsThisHour: 0,
  stepsOffset: today.adjusted.steps,
  lastHour: 0,
};
// ##### DATA INTILIZATION FOR STEPS PER HOUR #####
// fetch data from Device if available
try {
  stepsData = JSON.parse(fs.readFileSync("steps.txt", "json"));
  console.log("successfully loaded the steps-data from file");
} catch (e) {
  console.log("there were no innitial values on the device yet", e);
}

// ##### MONTH DATA ARRAY ######
const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// ##### MANAGE ALL DATE RELATED DATA ON CLICK-EVENT ######
// ################## AND DISPLAY IT ######################
// Update the <image> tags for Hours, minutes every tick with the current time
clock.ontick = () => {
  const now = new Date();

  // get data for date (panel 1)
  const month = [now.getMonth()]; // month will just be text
  const day = util.zeroPadAndSplit(now.getDate(), 2);
  const year = now.getFullYear().toString().split(""); // year needs no Zero-Padding
  // check for AM PM settings and adjust how time gets displayed accordingly
  let hour;
  if (preferences.clockDisplay === "12h") {
    const hourAmPm = now.getHours() % 12 || 12;
    hour = util.zeroPadAndSplit(hourAmPm, 2);
  } else {
    hour = util.zeroPadAndSplit(now.getHours(), 2);
  }
  // set AM PM light
  if (now.getHours() >= 12) {
    document.getElementById("am").style.opacity = 0.3;
    document.getElementById("pm").style.opacity = 1;
  } else {
    document.getElementById("am").style.opacity = 1;
    document.getElementById("pm").style.opacity = 0.3;
  }

  const min = util.zeroPadAndSplit(now.getMinutes(), 2);

  // display date-data
  MONTH.text = months[month];
  // reduce MONTH.text width if it is MAR or MAY (month_g as in 'group')
  if (month === 2 || month === 4) {
    const month_g = document.getElementById("month_g");
    month_g.groupTransform.scale.x = 0.9;
  }
  addDigits(DAY, day);
  addDigits(YEAR, year);
  addDigits(HOUR, hour);
  addDigits(MIN, min);
  //ddDigits(SEC, sec);
};

// ######## MANAGE STEPS-PER-HOUR-DATA CALCULATION ########
// ######### AND WRITE IT TO FILE OR DELETE FILE ##########
// update steps this hour (every 5 seconds)
// (it is not together with the ontick, because ontick only works when display is on,
// which messes up the calculation)
setInterval(() => {
  const now = new Date();
  if (now.getHours() != stepsData.lastHour) {
    // if hour has changed: delete old steps-data-file
    try {
      fs.unlinkSync("steps.txt");
    } catch (e) {
      console.log("could not delete file (after hour had changed):", e);
    }
    // also set the steps-data to nutral values
    stepsData.stepsOffset = today.adjusted.steps;
    stepsData.lastHour = now.getHours();
  }
  // update the steps per hour values
  stepsData.stepsThisHour = today.adjusted.steps - stepsData.stepsOffset;
  // overwrite the steps-data-file with the new values
  try {
    fs.writeFileSync("steps.txt", JSON.stringify(stepsData), "json");
  } catch (e) {
    console.log("could not write file (on the interval):", e);
  }
}, 5000);

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
  const cals = util.zeroPadAndSplit(activities.calories, 5);
  const floors = util.zeroPadAndSplit(activities.elevationGain, 4);
  const steps = util.zeroPadAndSplit(today.adjusted.steps, 5);

  // get stats-data (panel 3) (apart from heartRate)
  const hourSteps = util.zeroPadAndSplit(stepsData.stepsThisHour, 3);
  const bat = util.zeroPadAndSplit(Math.floor(battery.chargeLevel), 2); // is called bat because it cannot be called battery
  const distance = util.getDistance(activities.distance, units.distance);

  // display activity-data (panel 2)
  addDigits(CAL, cals);
  addDigits(FLOOR, floors);
  addDigits(STEP, steps);
  // display stats-data (panel 3)
  addDigits(HOUR_STEPS, hourSteps);
  addDigits(BATTERY, bat);
  addDigits(DISTANCE, distance);
}

// get and display heart-rate
const heartRate = "000";

const hr = new HeartRateSensor();
hr.onreading = () => {
  // get heartRate on change of heartRate
  heartRate = util.zeroPadAndSplit(hr.heartRate, 3);
  // render the HeartRate (seperate from the other numbers)
  addDigits(HEART, heartRate);
};
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
};
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
    els.forEach((el, i) => (el.href = `${nums[i]}.png`));
  }
}
