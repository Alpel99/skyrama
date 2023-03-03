# [Skyrama](https://www.skyrama.com/) Bot with [Botfather API](https://botfather.io/)

## Only works in german client on fullscreen, fully zoomed out!

### Features

* Auto Login with given username and password
* You need to close all ads/other popups yourself
* Landing your own planes
* Servicing any planes (get loot from rings, unpack, pack, fuel, "arrow", start)
* Landing planes from buddies
* Starting your own planes
* Collect passengers
* Click OK if a quest is completed or you level up
* Activate your tower to receive planes from buddies
* Counting started planes (Stats tab in botfather) + keeping track of time + planes/min
* Option to use quick service if available
* Cancel fast processing if accidentally clicked

### Known Issues

- [x] Sometimes not everything from the loot on the ring is collected 
    * should be fixable with all tuning options

- [ ] Not 100% accurate on image detection (tries to click void stuff sometimes)
    * wastes time, but haven't experienced issues until now, won't go shopping
- [ ] Unpack/pack is registering with the same template (not really an issue)
- [ ] Untangle that code into multiple files
- [X] Order landing matches by descending x value
- [ ] Could probably improve performance by cutting some unnecessary openCV calls


### Might also work with english, not tested
* will probably not support full functionality

### Marked planes to get an idea what the ring settings are for
<img src="https://i.ibb.co/CHFhN7X/marks.png" width="580" height="324" />

----

### Settings
#### Auto Login
* Username and password for auto login
    * You can also log in yourself on the website, might have to wait for the bot to click the cookie accept

#### General
* Starting the bot without auto login, will check for skyrama url anyway
* Time to wait for closing ads/popups & zooming out
* Delay between each task (pack, fuel etc.) from the bot in 10 ms steps

#### Game
* Option to enable/disable landing your planes
* Option to enable/disable landing planes from buddies
* Option to enable/disable to activate the tower to receive planes
* Option to enable/disable check for quick service
    * the bot will fall back to generic service if it detects qs to be unavailable

#### Start planes
* Option to enable/disable starting your planes
* Choose the way how planes should be started:
    * To the first buddy: Always use the first buddy in the list
    * To a selected buddy: Preselect a buddy by its current position
        * bot will save an image and try to find him again
    * To a random buddy: Choose a random buddy of the first (up to 5) from the list
    * To a country: send planes to a country
        * this needs to be preselected by sending one plane there before starting the bot
    * _only the first five buddies can be used, scrolling in the buddy list is not possible/will stop the bot from working_
* A number input that has different uses depending on the starting options:
    * Selected buddy: Choose buddy by index
    * Random buddy: How many random buddies
    * Country: How often the "send country planes routine" is iterated
        * this might be useful to work around skyrama lag

#### Tuning
* How often your own planes should be landed.
* How often your buddies planes should be landed.
    * Both of these are just loop numbers, no fancy work distribution

* Maximum planes to land at once (including helicopters/water planes)
* How often to click over the entire bar to start planes
    * higher numbers better to avoid currently "unstartable" planes
* How often to click on a single startable plane (might be multiple ones stacked)
* How often the basic tasks should be done
    * might be useful for quick planes, trying not to waste much time
* How often to iterate the ring collection routine
    * might increase chance of picking up everything before starting with tasks

#### Advanced
* Delay in ms for the bot to stay at each point of the circle while collecting rings
* How many points are calculated to describe the form of the ring
* Verbosity level: How much info/spam do you want while running the bot

verbosity|output
---------------|-------
0|only necessary/failure stuff
1|start/landing info+numbers
2|info+numbers for all tasks
3|more info of clicked buttons etc