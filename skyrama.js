var browser = new Browser("Skyrama", new Size(1920, 1080));
var startedplanes = 0;
var qs_done = 0;
var GLOBAL_TIMER = new Timer();
var QS_AVAILABLE = false;

var PEOPLE_TEMPLATE = new Image("templates/people.png");
var PLANES_TEMPLATE = new Image("templates/planes.png");
var LANDINGPLANES_DOWN_TEMPLATE = new Image("templates/landingplanes_down.png");
var LAND_TEMPLATE = new Image("templates/land.png");
var ARROW_TEMPLATE = new Image("templates/arrow.png");
var RING_TOP_TEMPLATE = new Image("templates/ringtop.png");
var RING_TEMPLATE = new Image("templates/ring.png");
var RING_FULL_TEMPLATE = new Image("templates/ring_closed.png");
var RING_WHITE_TPL = new Image("templates/ring_white.png");
var UNPACK_TEMPLATE = new Image("templates/unpack.png");
var PACK_TEMPLATE = new Image("templates/pack.png");
var CROSS_TEMPLATE = new Image("templates/redcross.png");
var DARKCROSS_TEMPLATE = new Image("templates/darkcross.png");
var BUDDY_TEMPLATE = new Image("templates/newbuddy.png");
var GO_TEMPLATE = new Image("templates/go.png");
var START_TEMPLATE = new Image("templates/start.png");
var FUEL_TEMPLATE = new Image("templates/fuel.png");
var FLY_TEMPLATE = new Image("templates/fly.png");
var BUDDYPLANE_TEMPLATE = new Image("templates/buddyplane.png");
var TOWER_RED_TEMPLATE = new Image("templates/tower_red.png");
var OK_TEMPLATE = new Image("templates/ok.png");
var CANCEL_TEMPLATE = new Image("templates/cancel.png");
var COOKIE_ACCEPT_TEMPLATE = new Image("templates/cookies.png");
var QS_TEMPLATE = new Image("templates/QS.png");

function click(tpl, trsh) {
  var match = Vision.findMatch(browser.takeScreenshot(), tpl, trsh);
  browser.leftClick(match.getRect().getCenter());
}

function loadWebsiteLogin() {
	var new_size = new Size(1920, 1080);
	browser.resize(new_size);
	var username = Config.getValue("auto_login_username");
	var passwd = Config.getValue("auto_login_password");
	Helper.log("Loading game website.");

  browser.loadUrl("https://www.skyrama.com/");
	browser.finishLoading();

  Helper.sleep(5);
	Helper.log("Entering account credentials.");

	var fill_uname_js = "document.getElementById('bgcdw_login_form_username').value = '" + username + "';";
	browser.executeJavascript(fill_uname_js);

	var fill_pword_js = "document.getElementById('bgcdw_login_form_password').value = '" + passwd + "';";
	browser.executeJavascript(fill_pword_js);

	var formsubmit_js = "document.bgcdw_login_form.submit();";
	browser.executeJavascript(formsubmit_js);

	Helper.log("Logging in. (This can take a few seconds)");
	Helper.sleep(2);

	browser.finishLoading();
	Helper.sleep(10);
	Helper.log("Logged in.");
}

function closeWindows() {
  click(COOKIE_ACCEPT_TEMPLATE, 0.95);
	Helper.sleep(1);
	Helper.log("Please close all ad windows, etc.");
	var time = Config.getValue("windowwait");
	for(var i = 0; i < time; i+=5) {
		var remaining = time-i;
		Helper.log("Please close windows. Time remaining: " + remaining);
		Helper.sleep(5);
	}
	Helper.log("Please go fullscreen and zoom as far out as possible! (The Bot doesn't move the camera itself)");
  var time = Config.getValue("camerawait");
  for(var i = 0; i < time; i+=5) {
    var remaining = time-i;
    Helper.log("Time remaining: " + remaining);
    Helper.sleep(5);
  }
}

function collectPeople() {
  var matches = Vision.findMatches(browser.takeScreenshot(), PEOPLE_TEMPLATE, 0.93);
	Helper.log("Collecting passengers " + matches.length + "x.")
	for(var i = 0; i < matches.length; i++) {
  	browser.moveMouse(matches[i].getRect().getCenter());
		Helper.msleep(125);
	}
}

function landPlanes() {
	var maxLandings = Config.getValue("runways");
	Helper.log("Trying to land " + maxLandings + " planes.");
	click(PLANES_TEMPLATE, 0.99);
	Helper.sleep(1);
	click(LANDINGPLANES_DOWN_TEMPLATE, 0.95);
	Helper.sleep(1);
  var matches = Vision.findMatches(browser.takeScreenshot(), LAND_TEMPLATE, 0.99, maxLandings);
	for(var i = 0; i < matches.length; i++) {
		click(LAND_TEMPLATE, 0.99);
		Helper.msleep(250);
	}
  Helper.log("Landed " + matches.length + " planes.");
  if(matches.length > 0) {
    var timer = new Timer();
    timer.start();
    checkTasks();
    while(!timer.hasExpired(8000)) {}
  }
  checkTasks();
}

function landBuddyPlanes() {
  var maxLandings = Config.getValue("runways");
	Helper.log("Trying to land " + maxLandings + " planes from Buddies.");
	click(PLANES_TEMPLATE, 0.99);
	Helper.sleep(1);
	click(BUDDYPLANE_TEMPLATE, 0.90);
	Helper.sleep(1);
  var matches = Vision.findMatches(browser.takeScreenshot(), LAND_TEMPLATE, 0.99, maxLandings);
	for(var i = 0; i < matches.length; i++) {
		click(LAND_TEMPLATE, 0.99);
		Helper.msleep(100);
	}
  Helper.log("Landed " + matches.length + " planes.");
  if(matches.length > 0) {
    var timer = new Timer();
    timer.start();
    checkTasks();
    while(!timer.hasExpired(8000)) {}
  }
  checkTasks();
}

function arrowPlanes() {
	var matches = Vision.findMatches(browser.takeScreenshot(), ARROW_TEMPLATE, 0.96);
	Helper.log("Clicking on " + matches.length + " arrows.");
	for(var i = 0; i < matches.length; i++) {
		browser.leftClick(matches[i].getRect().getCenter());
		Helper.msleep(100);
	}
	Helper.msleep(1500);
}

function getRings() {
  for(var j = 0; j < Config.getValue("ring_iters"); j++) {
    c1 = new Color(37, 234, 200, "hsv");
    c2 = new Color(43, 255, 230, "hsv");
    var move = new Point(150,60);
    var matches = Vision.findMatches(browser.takeScreenshot().copy(new Rect(move, new Point(1920, 910))).isolateColorRange(c1, c2, false), RING_WHITE_TPL, 0.95);
    Helper.log("Collecting from " + matches.length + " rings.");
    var n = Config.getValue("ring_points");
    var dx = 27, dy = 22, oy = -3, ox = 2, s = 2*Math.PI/n
    for(var i = 0; i < matches.length; i++) {
      toppoint = matches[i].getRect().getCenter().pointAdded(move);
      var d = Config.getValue("ring_delay");
      for(var j = 0; j < n; j++) {
        var x = dx*Math.cos(j*s) + ox
        var y = dy*Math.sin(j*s)+dy+oy
        var movepoint = toppoint.pointAdded(new Point(x, y));
        browser.moveMouse(movepoint);
        Helper.msleep(d);
      }
    }
  }
}

function unpackPlanes() {
	var matches = Vision.findMatches(browser.takeScreenshot(), UNPACK_TEMPLATE, 0.96);
	Helper.log("Unpacking " + matches.length + " planes.");
	for(var i = 0; i < matches.length; i++) {
		browser.leftClick(matches[i].getRect().getCenter());
		Helper.msleep(100);
	}
}

function redcross() {
  Helper.msleep(250);
	Helper.log("Clicking red cross.");
	click(CROSS_TEMPLATE,0.95);
  click(DARKCROSS_TEMPLATE,0.95);
	Helper.msleep(250);
}


function startPlanes() {
  redcross();
	Helper.log("Starting planes.");
	var match = Vision.findMatch(browser.takeScreenshot(), BUDDY_TEMPLATE, 0.98);
	var nextbuddy = match.getRect().getCenter();
	nextbuddy.setX(nextbuddy.getX() + 75);
	browser.moveMouse(nextbuddy);
	Helper.sleep(1);
	click(GO_TEMPLATE,0.98);
	Helper.sleep(1);
	var starts = Config.getValue("startplanes");
	for(var i = 0; i < starts; i++) {
		var matches = Vision.findMatches(browser.takeScreenshot(), START_TEMPLATE, 0.98);
		for(var j = 0; j < matches.length; j++) {
			browser.leftClick(matches[j].getRect().getCenter());
			Helper.msleep(10);
			browser.leftClick(matches[j].getRect().getCenter());
			Helper.msleep(100);
		}
	}
	Helper.sleep(2);
	arrowPlanes();
}

function fuelPlanes() {
	var matches = Vision.findMatches(browser.takeScreenshot(), FUEL_TEMPLATE, 0.96);
	Helper.log("Fueling " + matches.length + " planes.");
	for(var i = 0; i < matches.length; i++) {
		browser.leftClick(matches[i].getRect().getCenter());
		Helper.msleep(100);
	}
}

function packPlanes() {
	var matches = Vision.findMatches(browser.takeScreenshot(), PACK_TEMPLATE, 0.96);
	Helper.log("Packing " + matches.length + " planes.");
	for(var i = 0; i < matches.length; i++) {
		browser.leftClick(matches[i].getRect().getCenter());
		Helper.msleep(100);
	}
}

function flyPlanes() {
	var matches = Vision.findMatches(browser.takeScreenshot(), FLY_TEMPLATE, 0.96);
	Helper.log("Flying " + matches.length + " planes.");
	for(var i = 0; i < matches.length; i++) {
		browser.leftClick(matches[i].getRect().getCenter());
		Helper.msleep(100);
	}
	startedplanes += matches.length;
  setStats(GLOBAL_TIMER.getElapsedTime(), startedplanes);
}

function activateTower() {
  redcross();
  var matches = Vision.findMatches(browser.takeScreenshot(), TOWER_RED_TEMPLATE, 0.96);
  if(matches.length > 0) {
    Helper.log("Activating Tower.");
    browser.leftClick(matches[0].getRect().getCenter());
  }
  Helper.msleep(100);
}

function checkOk() {
  var matches = Vision.findMatches(browser.takeScreenshot(), OK_TEMPLATE, 0.98);
  if(matches.length > 0) {
    Helper.log("Clicked OK button.")
    browser.leftClick(matches[0].getRect().getCenter());
  }
  Helper.msleep(125);
}

function checkCancel() {
  var matches = Vision.findMatches(browser.takeScreenshot(), CANCEL_TEMPLATE, 0.98);
  if(matches.length > 0) {
    Helper.log("Clicked Cancel button.")
    browser.leftClick(matches[0].getRect().getCenter());
  }
  Helper.msleep(125);
}

function wait() {
  if(Config.getValue("delay") > 0) {
    Helper.msleep(125);
  }
}

function useQS() {
  var matches = Vision.findMatches(browser.takeScreenshot(), QS_TEMPLATE, 0.96);
  if(matches.length > 0) {
    Helper.log("Found and used QS button.");
    QS_AVAILABLE = true;
    for(var i = 0; i < matches.length; i++) {
      browser.leftClick(matches[i].getRect().getCenter());
      qs_done++;
      Helper.msleep(100);
    }
  } else {
    Helper.log("NO QS button found.")
    QS_AVAILABLE = false;
  }
  Stats.show("Quick Service", "QS clicked", qs_done);
  Stats.show("Advanced", "QS/min", (qs_done/(GLOBAL_TIMER.getElapsedTime()/60000)).toFixed(2));
}

function setStats(time, startedplanes) {
  Stats.show("General", "Started planes", startedplanes);
  Stats.show("General", "Started planes", startedplanes);
  var dtime = time/1000;
  var rs = Math.round(dtime%60)
  var secs = rs < 10 ? "0" + rs.toString() : rs.toString()
  var rm = Math.round((dtime/60)%60)
  var mins = rm < 10 ? "0" + rm.toString() : rm.toString()
  Stats.show("General", "Time", Math.floor((dtime/60)/60).toString() + ":" + mins + ":" +  secs);
  Stats.show("Advanced", "Planes/min", (startedplanes/(dtime/60)).toFixed(2));
}

function checkTasks() {
  if(Config.getValue("quick_service")) {
    useQS();
    wait();
  }
  if(!QS_AVAILABLE) {
    flyPlanes();
    wait();
    arrowPlanes();
    wait();
    getRings();
    wait();
    unpackPlanes();
    wait();
    packPlanes();
    wait();
    fuelPlanes();
    wait();
    flyPlanes();
    wait();
    getRings();
    wait();
  }
}

function basicTasks() {
  checkOk();
  checkCancel();
  wait();
  collectPeople();
  wait();
  if(Config.getValue("tower")) {
    activateTower();
  }
  wait();
}

function main() {
  setStats(0, startedplanes);
  if(Config.getValue("loggedin") == false || browser.getUrl() != "https://www.skyrama.com/game/playNow") {
    loadWebsiteLogin();
    closeWindows();
  }
  GLOBAL_TIMER.start()
  while (true) {
    basicTasks();
    wait();
    checkTasks();
    wait();
    if(Config.getValue("land")) {
      for(var i = 0; i < Config.getValue("prefown"); i++) {
        landPlanes();
        wait();
      }
    }
    redcross();
    wait();
    if(Config.getValue("buddies")) {
      landBuddyPlanes();
      wait();
      redcross();
      wait();
    }
    if(Config.getValue("start")) {
      startPlanes();
      wait();
    }
    checkTasks();
    wait();
  }
}

main()
