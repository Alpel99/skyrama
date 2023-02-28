var browser = new Browser("Skyrama", new Size(1920, 1080));
var startedplanes = 0;
var qs_done = 0;
var GLOBAL_TIMER = new Timer();
var QS_AVAILABLE = false;
var START_FALLBACK = false;
var BUDDY_SELECTED = false;
var SEL_BUDDY_TEMPLATE;

var PEOPLE_TEMPLATE = new Image("templates/people.png");
var PLANES_TEMPLATE = new Image("templates/planes.png");
var LANDINGPLANES_DOWN_TEMPLATE = new Image("templates/landingplanes_down.png");
var LAND_TEMPLATE = new Image("templates/land.png");
var ARROW_TEMPLATE = new Image("templates/arrow.png");
var RING_TOP_TEMPLATE = new Image("templates/ringtop.png");
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
var MAP_TEMPLATE = new Image("templates/map_tpl.png");
var SELECT_TEMPLATE = new Image("templates/select.png");
var NFLIGHT_TEMPLATE = new Image("templates/new_flight.png");


function click(tpl, trsh) {
  var match = Vision.findMatch(browser.takeScreenshot(), tpl, trsh);
  browser.leftClick(match.getRect().getCenter());
}

function loadWebsiteLogin() {
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
	for(var i = 0; i < Config.getValue("windowwait"); i+=5) {
		var remaining = Config.getValue("windowwait")-i;
		Helper.log("Please close windows. Time remaining: " + remaining);
		Helper.sleep(5);
	}
	Helper.log("Please go fullscreen and zoom as far out as possible! (The Bot doesn't move the camera itself)");
  for(var i = 0; i < Config.getValue("camerawait"); i+=5) {
    var remaining = Config.getValue("camerawait")-i;
    Helper.log("Time remaining: " + remaining);
    Helper.sleep(5);
  }
}

function collectPeople() {
  var matches = Vision.findMatches(browser.takeScreenshot(), PEOPLE_TEMPLATE, 0.93);
	if(Config.getValue("v_level") > 1) Helper.log("Collecting passengers " + matches.length + "x.")
	for(var i = 0; i < matches.length; i++) {
  	browser.moveMouse(matches[i].getRect().getCenter());
		Helper.msleep(125);
	}
}

function landOwnPlanes() {
  redcross();
	click(PLANES_TEMPLATE, 0.99);
	Helper.msleep(500);
	click(LANDINGPLANES_DOWN_TEMPLATE, 0.95);
  if(Config.getValue("v_level") > 1) Helper.log("Trying to land " + Config.getValue("runways") + " planes.");
	Helper.msleep(500);

  landPlanes(false);
}

function landBuddyPlanes() {
  redcross();
	click(PLANES_TEMPLATE, 0.99);
	Helper.msleep(500);
	click(BUDDYPLANE_TEMPLATE, 0.90);
  if(Config.getValue("v_level") > 1) Helper.log("Trying to land " + Config.getValue("runways") + " planes from Buddies.");
	Helper.msleep(500);

  landPlanes(true);
}

function landPlanes(buddy) {
	var maxLandings = Config.getValue("runways");
  var matches = Vision.findMatches(browser.takeScreenshot(), LAND_TEMPLATE, 0.99, maxLandings);
  if (maxLandings > 6 && matches.length == 6) {
    var diff = maxLandings - matches.length;
    var maxx = 0;
    var rmatch;
    matches.forEach(function(m) {
      if(m.getRect().getCenter().getX() > maxx) {
        maxx = m.getRect().getCenter().getX();
        rmatch = m;
      }
    });
    for (var i = 0; i < diff; i++) {
      browser.leftClick(rmatch.getRect().getCenter());
      Helper.msleep(250);
    }
  }
	for(var i = 0; i < matches.length; i++) {
		browser.leftClick(matches[i].getRect().getCenter());
		Helper.msleep(250);
	}
  var l = matches.length < 6 ? matches.length : 6 + " to " + maxLandings;
  var b = buddy ? " from buddies." : ".";
  if(Config.getValue("v_level") > 0) Helper.log("Landed " + l + " planes" + b);
  if(matches.length > 0) {
    var timer = new Timer();
    timer.start();
    checkTasks(true);
    while(!timer.hasExpired(8000)) {}
    if(buddy) hideBuddyFlags();
    if(buddy) hideBuddyFlags();
  }
  checkTasks(false);
}

function arrowPlanes() {
	var matches = Vision.findMatches(browser.takeScreenshot(), ARROW_TEMPLATE, 0.96);
	if(Config.getValue("v_level") > 1) Helper.log("Clicking on " + matches.length + " arrows.");
	for(var i = 0; i < matches.length; i++) {
		browser.leftClick(matches[i].getRect().getCenter());
		Helper.msleep(100);
	}
	Helper.msleep(1500);
}

function getRings() {
  for(var k = 0; k < Config.getValue("ring_iters"); k++) {
    c1 = new Color(37, 234, 200, "hsv");
    c2 = new Color(43, 255, 230, "hsv");
    var move = new Point(150,60);
    var matches = Vision.findMatches(browser.takeScreenshot().copy(new Rect(move, new Point(1920, 910))).isolateColorRange(c1, c2, false), RING_WHITE_TPL, 0.94);
    if(Config.getValue("v_level") > 1) Helper.log("Collecting from " + matches.length + " rings.");
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
	if(Config.getValue("v_level") > 1) Helper.log("Unpacking " + matches.length + " planes.");
	for(var i = 0; i < matches.length; i++) {
		browser.leftClick(matches[i].getRect().getCenter());
		Helper.msleep(100);
	}
}

function redcross() {
  Helper.msleep(250);
	if(Config.getValue("v_level") > 2) Helper.log("Clicking red cross.");
  //don't press logout
  var match = Vision.findMatch(browser.takeScreenshot(), CROSS_TEMPLATE, 0.95);
  if (match.getRect().getCenter().getY() > 60) browser.leftClick(match.getRect().getCenter());
  var match = Vision.findMatch(browser.takeScreenshot(), DARKCROSS_TEMPLATE, 0.95);
  if (match.getRect().getCenter().getY() > 60) browser.leftClick(match.getRect().getCenter());
	Helper.msleep(250);
}

function startPlanes() {
  redcross();
  if(START_FALLBACK) {
    if(Config.getValue("start_fallback")) {
      Helper.log("FALLBACK: Starting planes to first buddy.");
      startPlanesFirstBuddy();
    } else {
      Helper.log("FALLBACK: Not selected, no planes started.")
    }
  } else {
    switch(Config.getValue("start_opt")) {
      case "first":
        if(Config.getValue("v_level") > 0) Helper.log("Starting planes to first buddy.");
        startPlanesFirstBuddy();
        break;
      case "selected":
        if(!BUDDY_SELECTED) {
          createBuddyTemplate();
        } else {
          startPlanesSelectedBuddy();
        }
        if(Config.getValue("v_level") > 0) Helper.log("Starting planes to selected buddy #" + Config.getValue("start_num") + ".");
        break;
      case "country":
        if(Config.getValue("v_level") > 0) Helper.log("Starting planes to country.");
        for (var i = 0; i < Config.getValue("start_num"); i++) {
          startPlanesCountry();
        }
        break;
      case "random":
        if(Config.getValue("v_level") > 0) Helper.log("Starting planes to random buddy, up to " + Config.getValue("start_num") + ".");
        startPlanesRandomBuddy();
        break;
    }
  }
}

function createBuddyTemplate() {
  redcross();
  var img = browser.takeScreenshot();
	var match = Vision.findMatch(img, BUDDY_TEMPLATE, 0.98);
  if(match.isValid()) {
    var sel_buddy_point = match.getRect().getTopLeft().pointAdded(new Point(Config.getValue("start_num")*79, 6));
    var sel_buddy = img.copy(new Rect(sel_buddy_point.pointAdded(new Point(20,0)), new Size(55, 85)))
    sel_buddy.save("selectedbuddy.png");
    BUDDY_SELECTED = true;
    if(Config.getValue("v_level") > 0) Helper.log("Created new selected buddy template 'selectedbuddy.png'.")
    Helper.msleep(500);
    SEL_BUDDY_TEMPLATE = new Image("selectedbuddy.png");
    Helper.msleep(500);
  } else {
    Helper.log("Something went wrong with the buddy selection.");
  }
}

function startPlanesSelectedBuddy() {
  var img = browser.takeScreenshot();
  var checkBuddy = Vision.findMatch(img, SEL_BUDDY_TEMPLATE, 0.98);
  if(!checkBuddy.isValid()) {
    var checknot = Config.getValue("start_fallback") ? " " : " not ";
    Helper.log("Buddy no longer found," + checknot + "using fallback");
    START_FALLBACK = true;
  } else {
    var buddy = checkBuddy.getRect().getCenter()
    if(Config.getValue("start_green")) {
      var move = new Point(-34, -11)
      var col = img.getPixelColor(buddy.pointAdded(move));
      if (col.getRed() < 100) {
        startPlanesBuddy(buddy); // green
      } else {
        Helper.log("Selected buddy not green. No fallback for this implemented.");
      }
    } else {
      startPlanesBuddy(buddy);
    }
  }
}

function startPlanesCountry() {
  redcross();
	click(PLANES_TEMPLATE, 0.99);
	Helper.msleep(500);
  browser.takeScreenshot().save("test.png")
	click(NFLIGHT_TEMPLATE, 0.85);
  Helper.msleep(500);
  var checkGo = Vision.findMatch(browser.takeScreenshot(), START_TEMPLATE, 0.98);
  if(!checkGo.isValid()) {
    if(Config.getValue("v_level") > 0) Helper.log("No planes to start available.");
    return;
  }
  browser.leftClick(checkGo.getRect().getCenter());
  Helper.msleep(500);
  var checkMap = Vision.findMatch(browser.takeScreenshot(), MAP_TEMPLATE, 0.99);
  if(!checkMap.isValid()) {
    var checknot = Config.getValue("start_fallback") ? " " : " not ";
    Helper.log("No country selected," + checknot + "using fallback");
    START_FALLBACK = true;
  } else {
    Helper.sleep(2);
    var checkSelect = Vision.findMatch(browser.takeScreenshot(), SELECT_TEMPLATE, 0.98);
    if(!checkSelect.isValid()) {
      Helper.sleep(3);
      checkSelect = Vision.findMatch(browser.takeScreenshot(), SELECT_TEMPLATE, 0.98);
    }
    if(!checkSelect.isValid()) {
      if(Config.getValue("v_level") > 0) Helper.log("No people in country to start to available.");
    } else {
      click(SELECT_TEMPLATE, 0.97);
      Helper.msleep(125);
      startPlanesClick();
      redcross();
    }
  }
}

function startPlanesRandomBuddy() {
  redcross();
  var max = Config.getValue("start_num");
  var img = browser.takeScreenshot();
	var match = Vision.findMatch(img, BUDDY_TEMPLATE, 0.98);
	var nextbuddy = match.getRect().getCenter();
  var move = new Point(-25,-1);
  // nextbuddy.setX(nextbuddy.getX() + 79);

  if(Config.getValue("start_green") && max < 5) {
    var c = 0;
    for (var i = 0; i < 6; i++) {
      var col = img.getPixelColor(nextbuddy.pointAdded(move))
      nextbuddy.setX(nextbuddy.getX() + 79);
      if (col.getRed() < 100) {
        c++; // green/not gray
      }
    }
    max = c < max ? c : max;
    if(Config.getValue("v_level") > 1) Helper.log(c + " green buddies found.");
  }
  var t = Math.floor(Math.random() * max)+1;
  if(Config.getValue("v_level") > 0) Helper.log("Starting planes to buddy #" + (t) + ".");
  startPlanesBuddy(match.getRect().getCenter().pointAdded(new Point((t)*79, 0)))
}

/*
Color(r: 133, g: 148, b: 147) # buddy tpl
Color(r: 51, g: 160, b: 71)   # green
Color(r: 173, g: 175, b: 175) # gray
*/

function startPlanesFirstBuddy() {
  redcross();
	var match = Vision.findMatch(browser.takeScreenshot(), BUDDY_TEMPLATE, 0.98);
	var nextbuddy = match.getRect().getCenter();
  nextbuddy.setX(nextbuddy.getX() + 79);
  if(Config.getValue("start_green")) {
    var move = new Point(-25,-1);
    var col = img.getPixelColor(nextbuddy.pointAdded(move))
    if (col.getRed() < 100) {
      // green
      startPlanesBuddy(nextbuddy);
    } else {
      if(Config.getValue("v_level") > 1) Helper.log("No green buddy found.");
    }
  } else {
    startPlanesBuddy(nextbuddy);
  }
}

function startPlanesBuddy(nextbuddy) {
  browser.moveMouse(nextbuddy);
	Helper.sleep(1);
	click(GO_TEMPLATE,0.98);
	Helper.msleep(500);
  startPlanesClick();
}

function startPlanesClick() {
	for(var i = 0; i < Config.getValue("startplanes_row"); i++) {
		var matches = Vision.findMatches(browser.takeScreenshot(), START_TEMPLATE, 0.98);
		for(var j = 0; j < matches.length; j++) {
      for(var k = 0; k < Config.getValue("startplanes_single"); k++) {
        browser.leftClick(matches[j].getRect().getCenter());
        Helper.msleep(100);
        browser.leftClick(matches[j].getRect().getCenter());
        Helper.msleep(200);
      }
		}
	}
}

function fuelPlanes() {
	var matches = Vision.findMatches(browser.takeScreenshot(), FUEL_TEMPLATE, 0.96);
	if(Config.getValue("v_level") > 1) Helper.log("Fueling " + matches.length + " planes.");
	for(var i = 0; i < matches.length; i++) {
		browser.leftClick(matches[i].getRect().getCenter());
		Helper.msleep(100);
	}
}

function packPlanes() {
	var matches = Vision.findMatches(browser.takeScreenshot(), PACK_TEMPLATE, 0.96);
	if(Config.getValue("v_level") > 1) Helper.log("Packing " + matches.length + " planes.");
	for(var i = 0; i < matches.length; i++) {
		browser.leftClick(matches[i].getRect().getCenter());
		Helper.msleep(100);
	}
}

function flyPlanes() {
	var matches = Vision.findMatches(browser.takeScreenshot(), FLY_TEMPLATE, 0.96);
	if(Config.getValue("v_level") > 1) Helper.log("Flying " + matches.length + " planes.");
	for(var i = 0; i < matches.length; i++) {
		browser.leftClick(matches[i].getRect().getCenter());
		Helper.msleep(100);
	}
	startedplanes += matches.length;
  setStats(GLOBAL_TIMER.getElapsedTime(), startedplanes);
}

function hideBuddyFlags() {
  var move = new Point(30, 30)
  var matches = Vision.findMatches(browser.takeScreenshot(), ARROW_TEMPLATE, 0.96);
  if(Config.getValue("v_level") > 1) Helper.log("Clicking on " + matches.length + " triangles beneath on planes that have arrows to possibly hide buddy flags.");
	for(var i = 0; i < matches.length; i++) {
		browser.leftClick(matches[i].getRect().getCenter().pointAdded(move));
		Helper.msleep(125);
	}
  Helper.msleep(125);
}

function activateTower() {
  redcross();
  var matches = Vision.findMatches(browser.takeScreenshot(), TOWER_RED_TEMPLATE, 0.96);
  if(matches.length > 0) {
    if(Config.getValue("v_level") > 2) Helper.log("Activating Tower.");
    browser.leftClick(matches[0].getRect().getCenter());
  }
  Helper.msleep(100);
}

function checkOk() {
  var matches = Vision.findMatches(browser.takeScreenshot(), OK_TEMPLATE, 0.98);
  if(matches.length > 0) {
    if(Config.getValue("v_level") > 2) Helper.log("Clicked OK button.")
    browser.leftClick(matches[0].getRect().getCenter());
  }
  Helper.msleep(125);
}

function checkCancel() {
  var matches = Vision.findMatches(browser.takeScreenshot(), CANCEL_TEMPLATE, 0.98);
  if(matches.length > 0) {
    if(Config.getValue("v_level") > 2) Helper.log("Clicked Cancel button.")
    browser.leftClick(matches[0].getRect().getCenter());
  }
  Helper.msleep(125);
}

function wait() {
    Helper.msleep(10*Config.getValue("delay"));
}

function useQS() {
  var matches = Vision.findMatches(browser.takeScreenshot(), QS_TEMPLATE, 0.96);
  if(matches.length > 0) {
    if(Config.getValue("v_level") > 1) Helper.log("Found and used QS button.");
    QS_AVAILABLE = true;
    for(var i = 0; i < matches.length; i++) {
      browser.leftClick(matches[i].getRect().getCenter());
      qs_done++;
      Helper.msleep(125);
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

function checkTasks(single) {
  if(Config.getValue("quick_service")) {
    useQS();
    wait();
  }
  if(!QS_AVAILABLE) {
    iter = single ? 1 : Config.getValue("task_iter");
    for(var i = 0; i < iter; i++) {
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
  if(Config.getValue("loggedin") != true || browser.getUrl() != "https://www.skyrama.com/game/playNow") {
    loadWebsiteLogin();
    closeWindows();
  }
  GLOBAL_TIMER.start()
  while (true) {
    basicTasks();
    wait();
    checkTasks(false);
    wait();
    if(Config.getValue("land")) {
      for(var i = 0; i < Config.getValue("prefown"); i++) {
        landOwnPlanes();
        wait();
      }
    }
    if(Config.getValue("buddies")) {
      for(var i = 0; i < Config.getValue("prefbud"); i++) {
        landBuddyPlanes();
        wait();
      }
    }
    if(Config.getValue("start")) {
      startPlanes();
      wait();
    }
    checkTasks(false);
    wait();
  }
}

main()