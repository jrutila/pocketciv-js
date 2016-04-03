var city = require("../../../src/actions/city");
var farm = require("../../../src/actions/farm");
var acquire = require("../../../src/actions/acquire");

function disableNext(tour) {
     $('.popover-navigation [data-role="next"]').hide(); 
}
var delay = 500;
module.exports = {
    "scenario": "scenario1",
    "steps": [
        {
            element: "#infobar",
            title: "Infobar",
            placement: "bottom",
            content: "Welcome to Pocket Civ Online Tutorial. This tutorial will teach \
            you how to play Pocket Civ but also how to use this website. Follow the steps by clicking \
            Next or the pointed element.",
            onShow: function(tour) {
                $("#startButton").prop('disabled', true);
                $("#showTechTree").attr('style', 'pointer-events: none; opacity: 0.5');
            }
        },
        {
            element: "#infobar",
            title: "Infobar",
            placement: "bottom",
            content: "This is the info bar. It shows you four key things about \
            your Empire: Era, Gold, Glory and the phase you are in.",
        },
        {
            element: "#infobar > span:nth(1)",
            title: "Era",
            placement: "bottom",
            content: "<strong>Era</strong> is the time of the game. The game ends at the end of \
            8th era. Every time you draw the last card from the deck, the Era \
            increases by one.",
        },
        {
            element: "#infobar > span:nth(2)",
            title: "Gold",
            placement: "bottom",
            content: "<strong>Gold</strong> and Tribes are used as the currency for purchasing Advances and \
            Wonders. You don't usually have to worry about Gold for the couple of \
            first Eras.",
        },
        {
            element: "#infobar > span:nth(3)",
            title: "Glory",
            placement: "bottom",
            content: "<strong>Glory</strong> is your score. Glory is collected at the end of Era and \
            when the Game ends. You get Glory from the Advances and Wonders. \
            It is used only for scoring the game.",
        },
        {
            element: "#infobar",
            title: "Phase",
            placement: "bottom",
            content: "Every <strong>Round</strong> consists of following <strong>Phases</strong>: \
            <dl> \
                <dt>Populate</dt><dd>You get more Tribes to your Empire</dd> \
                <dt>Move</dt><dd>You get to move the Tribes in you Empire</dd> \
                <dt>Event</dt><dd>Some random Event happens to your Empire</dd> \
                <dt>Advance</dt><dd>You build your Empire by using the Tribes</dd> \
                <dt>Upkeep</dt><dd>Tribes and Cities need support or they will vanish</dd> \
            </dl> \
            These phases are explained to you in the first Round of your game.",
        },
        {
            element: "#tribes5",
            title: "Map",
            placement: "right",
            content: "This is the <strong>Map</strong>. It is divided to maximum of eight \
            <strong>Regions</strong>. This icon shows, that Region <span class='areaCode'>5</span> \
            has one tribe. Tribes are the most important currency in the game. \
            They are used to advance your Empire. We go through other map icons later.",
        },
        {
            element: "#startButton",
            title: "Start the Game",
            placement: "bottom",
            content: "You can now start the Game. Pay attention to the goal of this scenario. \
            You have to build a city to Region <span class='areaCode'>4</span> before you have \
            drawn the last card from the deck.",
            onShown: disableNext,
            reflex: true,
            onShow: function(tour) {
                $("#startButton").prop('disabled', false);
            },
            onPrev: function(tour) {
                $("#startButton").prop('disabled', true);
            }
        },
        {
            element: "#infobar > span:nth(4)",
            title: "Populate",
            placement: "bottom",
            content: "Every Round starts with the Populate phase. In this phase every \
            Region that has at least one tribe gets one new tribe.",
            prev: -1,
            onShow: function(tour) {
                $("#changePrompt button:first").prop('disabled', true);
            }
        },
        {
            element: "#changePrompt button:first",
            title: "Changes",
            placement: "bottom",
            content: "Here you can see what changes are happening to your Empire. \
            Because you had one tribe on your Region <span class='areaCode'>5</span> \
            you are now getting one more. You can't influence the game when changes \
            are shown to you. You just have to accept the changes.",
            reflex: true,
            onShow: function(tour) {
                $("#changePrompt button:first").prop('disabled', false);
            },
            onShown: disableNext,
        },
        {
            element: "#infobar > span:nth(4)",
            title: "Moving",
            placement: "bottom",
            content: "During Move phase you move your Tribes between the Regions. \
            Every Tribe can move to an adjacent Region and no further.",
            prev: -1
        },
        {
            element: "#area5 .tut",
            title: "Moving",
            placement: "top",
            content: "First click the Region where you are moving a Tribe <i>from</i>. \
            Obviously you don't have other options than Region <span class='areaCode'>5</span>. \
            <p>You can click anywhere in the Region.</p>",
            onShow: function(tour) {
                tour.signals && tour.signals.map.add(function(event, arg) {
                    if (event == "click" && arg == "5")
                        tour.next();
                });
            },
            onHide: function(tour) {
                tour.signals.map.removeAll();
            },
            onShown: disableNext,
        },
        {
            element: "#area7 .tut",
            title: "Moving",
            placement: "right",
            content: "Second, click the Region where you want the Tribe to move. \
            You have to move the Tribe to Region <span class='areaCode'>7</span> so that \
            you get more Tribes on the next Populate phase. \
            Also, Region <span class='areaCode'>2</span> has only a Desert so it does not \
            <strong>Support</strong> your Tribe. \
            <p>You can click anywhere in the Region.</p>",
            onShow: function(tour) {
                tour.signals && tour.signals.map.add(function(event, arg) {
                    if (event == "click" && arg == "7")
                        tour.next();
                });
            },
            onHide: function(tour) {
                tour.signals.map.removeAll();
            },
            onShown: disableNext,
            prev: -1
        },
        {
            element: "#rightAction .done:first",
            title: "Moving",
            placement: "bottom",
            content: "You can try moving the Tribes around. You cannot make an invalid move. \
            Be sure to end the moving so that both <span class='areaCode'>5</span> and <span class='areaCode'>7</span> \
            have one Tribe. \
            When your movements are ready end the Move phase by clicking \"Done\"",
            onShown: disableNext,
            prev: -1,
            reflex: true,
        },
        {
            element: "#infobar > span:nth(4)",
            title: "Event",
            placement: "bottom",
            content: "After moving, you have to draw an <strong>Event Card</strong>. \
            Events are usually bad things that happen to your Empire. So, first you plan \
            your next Round and Move your Tribes to their positions. Then an Event messes \
            it all up. In some cases the Event can also be positive.",
            prev: -1,
            onShow: function() {
                $("#deck .draw").addClass("hidden");
            }
        },
        {
            element: "#deck button.draw",
            title: "Event Deck",
            placement: "top",
            content: "Events are determined by drawing an Event Card from the Deck. \
            The number below shows that there is thirteen cards left in the Deck. \
            The deck contains sixteen cards but three are always discarded after the \
            deck has run out. <p>Draw an Event Card by clicking the Deck.</p>",
            onShow: function() {
                $("#deck .draw").removeClass("hidden");
            },
            onShown: disableNext,
            onHide: function(tour) {
                $("#eventRunner").addClass("hidden");
                debugger;
                $("#deck .draw").addClass("hidden");
            },
            reflex: true
        },
        {
            element: "#card .square",
            title: "Event Card",
            placement: "top",
            content: "Event Cards also work as a method of getting random numbers. \
            Every card has a <strong>Red Circle</strong>, <strong>Green Square</strong> \
            and a <strong>Blue Hex</strong>. They are referenced in the Event descriptions.",
            prev: -1
        },
        {
            element: "#card .gold",
            title: "Event Card",
            placement: "right",
            content: "Other random values are card's <strong>Friendliness</strong> and \
            the amount of <strong>Gold</strong> it has. These values are used for example in Visitation \
            events to determine the hospitality of the Visiting Empire.",
        },
        {
            element: "#card .event:first",
            title: "Event",
            placement: "top",
            content: "This list shows the possible Events this Card can cause. Leftmost \
            number is the Era number. You can determine the Event by finding the correct \
            event for this Era from the list. In this case it is the <strong>Earthquake</strong> \
            event (You are on Era 1). If you would have been on Era 2 no event would have happened.",
        },
        {
            element: "#eventRunner dd:first",
            title: "Event",
            placement: "right",
            content: "The Event's description is shown here. It tells you what \
            will happen to your Empire step-by-step. Events usually require you to draw more cards \
            or make decisions about the Event. Acquired <strong>Advances</strong> \
            have <span class='negative'>negative</span> or <span class='positive'>positive</span> effects on Events.",
            onShow: function(tour) {
                $("#eventRunner").removeClass("hidden");
            },
        },
        {
            element: "#deck button.draw",
            title: "Region Card",
            placement: "top",
            content: "In Earthquake (and actually many others) you first determine the <strong>Active \
            Region</strong> by drawing an Region Card. That is exactly the same deck that is used \
            for Event Cards but this time we will be looking the value of the Red Circle. \
            <p>Draw the Card now</p>",
            reflex: true,
            onShown: disableNext,
            onShow: function() {
                $("#deck .draw").removeClass("hidden");
            }
        },
        {
            element: "#card .circle",
            title: "Region Card",
            placement: "right",
            content: "This Red Circle determines that the Active Region is <span class='areaCode'>2</span>.",
            prev: -1,
            delay: delay,
            onShow: function(tour) {
                $("#changePrompt button:first").prop('disabled', true);
            }
        },
        {
            element: "#changePrompt button:first",
            title: "Earthquake results",
            placement: "bottom",
            content: "Luckily, the Earthquake hit an empty Region \
            <span class='areaCode'>2</span> that has no <strong>Fault</strong> \
            (<span class='icon fault small'/>) mark. The Region now gets a \
            Fault (See Event description step 2). Fault does not affect the Region \
            otherwise but if the Earthquake hits there again the Earthquake will be more \
            devastating.",
            reflex: true,
            onShown: disableNext,
            onShow: function(tour) {
                $("#changePrompt button:first").prop('disabled', false);
            }
        },
        {
            element: "#infobar .infophase",
            title: "Advance",
            placement: "bottom",
            content: "Now you get to build your Empire to be bigger and better! During <strong>Advance</strong> \
            phase you build <strong>Farms</strong> and <strong>Cities</strong> and <strong>Wonders</strong>, \
            find Gold with <strong>Expeditions</strong> and <strong>Mining</strong>, \
            and research <strong>Advances</strong>. All of these actions require Tribes...",
            prev: -1,
            onShow: function() {
                $("#advancePhase button").prop("disabled", true);
            },
        },
        {
            element: "#advancePhase .done:first",
            title: "Advance",
            placement: "bottom",
            content: "...which you don't have at the moment. It is better to keep \
            those two tribes populating. So, just skip this phase for now \
            by clicking \"Done\"",
            onShown: disableNext,
            onShow: function(tour) {
                tour.pauseOn = 'support';
                $("#advancePhase button.done").prop("disabled", false);
            },
            reflex: true,
        },
        {
            element: "#infobar .infophase",
            title: "Upkeep",
            placement: "bottom",
            content: "During <strong>Upkeep</strong> phase you check that your \
            Tribes and Cities are <strong>Supported</strong>. \
            Following <strong>Resources</strong> each support one Tribe: \
            <ul> \
            <li>Forest <span class='icon forest small' /></li> \
            <li>Mountain <span class='icon mountain small' /></li> \
            <li>Volcano <span class='icon volcano small' /></li> \
            <li>Farm <span class='icon farm small' /></li> \
            </ul> \
            Also, every City supports as many Tribes as is the \
            City's <strong>AV</strong> (Advance Value). \
            Unsupported Tribes are removed from your Empire at the Upkeep phase. \
            <p>Every City needs a \
            Farm in the same Region. If a Region with a City does not have \
            the supporting Farm, the City AV is decreased by one. If the City \
            reaches AV of zero, it is removed from the Region. \
            <p>At the moment, your Empire is fully supported</p>",
            prev: -1,
            onNext: function(tour) {
                tour.pauseOn = undefined;
                tour.afterEvent = this.next;
                tour.engineContinue && tour.engineContinue();
            }
        },
        {
            element: "#changePrompt button:first",
            title: "Populate",
            placement: "bottom",
            content: "After Upkeep, you start another Round. \
            Your Tribes populated more Tribes to your Empire!",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay
        },
        {
            element: "#rightAction .done:first",
            title: "Moving",
            placement: "bottom",
            content: "Move your tribes so that Regions \
            <span class='areaCode'>5</span> and <span class='areaCode'>7</span> \
            both have one Tribe and Region <span class='areaCode'>8</span> has \
            two Tribes. As you can see, Region <span class='areaCode'>8</span> supports two \
            Tribes.",
            onShown: disableNext,
            prev: -1,
            reflex: true,
        },
        {
            element: "#deck button.draw",
            title: "Event Card",
            placement: "top",
            content: "Draw the next Event",
            reflex: true,
            onShown: disableNext,
            prev: -1
        },
        {
            element: "#advancePhase .done:first",
            title: "Advance",
            placement: "bottom",
            content: "Phew! No event, that's always good news. Skip this phase (again!) for now \
            by clicking \"Done\"",
            onShown: disableNext,
            reflex: true,
            prev: -1
        },
        {
            element: "#changePrompt button:first",
            title: "Populate",
            placement: "bottom",
            content: "This round you kicked in three more Tribes! Now you are going to get \
            things done.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay
        },
        {
            element: "#rightAction .done:first",
            title: "Moving",
            placement: "bottom",
            content: "Your target now is try to get a City to Region <span class='areaCode'>8</span>. \
            That is your midway point to the final goal. First you need to build a Farm so that the \
            City is supported. Farm costs two tribes. Move tribes like this: \
            <ul> \
            <li><span class='areaCode'>1</span>: <span class='tribes'>1</span></li> \
            <li><span class='areaCode'>8</span>: <span class='tribes'>4</span></li> \
            <li><span class='areaCode'>7</span>: <span class='tribes'>1</span></li> \
            <li><span class='areaCode'>5</span>: <span class='tribes'>1</span></li> \
            </ul>",
            onShown: disableNext,
            prev: -1,
            reflex: true,
        },
        {
            element: "#deck button.draw",
            title: "Event Card",
            placement: "top",
            content: "Draw the next Event and hope that it does not \
            mess your Farm plan.",
            reflex: true,
            onShown: disableNext,
            prev: -1
        },
        {
            element: "#deck button.draw",
            title: "Region Card",
            placement: "top",
            content: "Okay, <strong>Famine</strong>. Get \
            the Active Region to see where the Famine hits. You will lose all your Tribes \
            in that Region.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay
        },
        {
            element: "#changePrompt button:first",
            title: "Event Results",
            placement: "bottom",
            content: "Ouch! You lost one Tribe. Luckily, it doesn't mess you Farm plan!",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay,
        },
        {
            element: "#rightAction .advance-farm",
            title: "Create a Farm",
            placement: "bottom",
            content: "Back to the plan. To create a <strong>Farm</strong> you need to reduce two Tribes and a Forest. \
            Start building the Farm to Region <span class='areaCode'>8</span> by clicking \
            \""+farm.title+"\"",
            onShown: disableNext,
            prev: -1,
            reflex: true,
            onShow: function() {
                $("#advancePhase button").prop("disabled", true);
                $("#advancePhase .advance-farm").prop("disabled", false);
            }
        },
        {
            element: "#reducer",
            title: "Common Reducer",
            placement: "left",
            content: "This is the <i>Common Reducer</i>. It is used to decrease and increase \
            Tribes and Resources in your Empire. Depending on the case you choose one or more \
            Regions or set the target values for (for example) Tribes.",
            prev: -1,
        },
        {
            element: "#reducer .areaCode",
            title: "Create a Farm",
            placement: "left",
            content: "To create a Farm you must select the Regions where you want the Farm to \
            be built. Your only option is Region <span class='areaCode'>8</span>. \
            Click on the Region number or click the Region directly on the Map.",
            onShown: disableNext,
            reflex: true,
            onShow: function(tour) {
                tour.signals && tour.signals.map.add(function(event, arg) {
                    if (event == "click" && arg == "8")
                        tour.next();
                });
            },
            onHide: function(tour) {
                tour.signals.map.removeAll();
            },
        },
        {
            element: "#reducer .done",
            title: "Create a Farm",
            placement: "bottom",
            content: "The reducer shows you the changes that will happen. You are going to get \
            the Farm but lose a Forest and two Tribes. Accept this by clicking \"Done\"",
            onShown: disableNext,
            prev: -1,
            reflex: true,
        },
        {
            element: "#changePrompt button:first",
            title: "Create a Farm",
            placement: "bottom",
            content: "You are shown again the changes happening to your Empire.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay,
        },
        {
            element: "#farm8",
            title: "Farm",
            placement: "right",
            content: "Here is your brand new Farm. It looks good, doesn't it. \
            Note that your Region <span class='areaCode'>8</span> Support is still \
            two (<span class='icon mountain small'/>+<span class='icon farm small'/>).",
            prev: -1,
            onShow: function() {
                $("#advancePhase button").prop("disabled", true);
            }
        },
        {
            element: "#advancePhase .done:first",
            title: "Next Round",
            placement: "bottom",
            content: "You can't do anything else for now. Let's get to the next Round.",
            onShown: disableNext,
            reflex: true,
            onShow: function() {
                $("#advancePhase button.done").prop("disabled", false);
            }
        },
        {
            element: "#changePrompt button:first",
            title: "Populate",
            placement: "bottom",
            content: "Three Tribes coming in again. That damned Famine emptied the \
            Region <span class='areaCode'>5</span>.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay
        },
        {
            element: "#rightAction .done:first",
            title: "Moving",
            placement: "bottom",
            content: "You have the Farm now. City needs four tribes to build.<br/> \
            Move tribes like this: \
            <ul> \
            <li><span class='areaCode'>1</span>: <span class='tribes'>1</span></li> \
            <li><span class='areaCode'>8</span>: <span class='tribes'>4</span></li> \
            <li><span class='areaCode'>7</span>: <span class='tribes'>1</span></li> \
            <li><span class='areaCode'>5</span>: <span class='tribes'>1</span></li> \
            </ul>",
            onShown: disableNext,
            prev: -1,
            reflex: true,
        },
        {
            element: "#deck button.draw",
            title: "Event Card",
            placement: "top",
            content: "Again, the exciting part of the game...",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay
        },
        {
            element: "#deck button.draw",
            title: "Region Card",
            placement: "top",
            content: "<strong>Flood</strong> is a bad one. It can turn into a \
            <strong>Tsunami</strong> if it hits a Region bordering the <strong>Sea</strong>. \
            Draw the Region Card well, my friend.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay,
            onHide: function(tour) {
                tour.afterEvent = this.next;
            }
        },
        {
            element: "#changePrompt button:first",
            title: "Flood Result",
            placement: "bottom",
            content: "You lucky one! The flood hit the Region <span class='areaCode'>3</span> \
            and did not become a Tsunami. \
            Flood (not a Tsunami) creates a Forest in the Active Region. Essentially the \
            Region <span class='areaCode'>3</span> is now a habitable environment. This is \
            exactly what you needed.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay+1500
        },
        {
            element: "#rightAction .advance-city",
            title: "Build a City",
            placement: "bottom",
            content: "To build a <strong>City</strong> you need to reduce <i>four</i> Tribes. \
            Start building the City to Region <span class='areaCode'>8</span> by clicking \
            \""+city.title+"\"",
            onShown: disableNext,
            prev: -1,
            reflex: true,
            onShow: function() {
                $("#advancePhase button").prop("disabled", true);
                $("#advancePhase .advance-city").prop("disabled", false);
            }
        },
        {
            element: "#reducer .areaCode",
            title: "Build a City",
            placement: "left",
            content: "Build the City to Region <span class='areaCode'>8</span>.",
            onShow: function(tour) {
                tour.signals && tour.signals.map.add(function(event, arg) {
                    if (event == "click" && arg == "8")
                        tour.next();
                });
            },
            onHide: function(tour) {
                tour.signals.map.removeAll();
            },
            onShown: disableNext,
            reflex: true,
            prev: -1,
        },
        {
            element: "#reducer .done",
            title: "Build a City",
            placement: "bottom",
            content: "Looks good.",
            onShown: disableNext,
            prev: -1,
            reflex: true,
        },
        {
            element: "#changePrompt button:first",
            title: "Build a City",
            placement: "bottom",
            content: "You get a City with <strong>AV</strong> of one and lose four Tribes.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay,
        },
        {
            element: "#advancePhase .done:first",
            title: "Next Round",
            placement: "bottom",
            content: "We have a City now, but so little Tribes. Remember, your ultimate goal is \
            to build the City to Region <span class='areaCode'>4</span> and you have only couple \
            of Rounds left (six cards).",
            onShown: disableNext,
            reflex: true,
            prev: -1,
            onShow: function() {
                $("#advancePhase button").prop("disabled", true);
                $("#advancePhase button.done").prop("disabled", false);
            }
        },
        {
            element: "#changePrompt button:first",
            title: "Populate",
            placement: "bottom",
            content: "Three Tribes, again. Remember, only tribes generate tribes. Cities do not get you more tribes.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay
        },
        {
            element: "#rightAction .done:first",
            title: "Moving",
            placement: "bottom",
            content: "You have to spread the Tribes so that you get more \
            Tribes in the Population phase.<br/> \
            Move tribes like this: \
            <ul> \
            <li><span class='areaCode'>1</span>: <span class='tribes'>1</span></li> \
            <li><span class='areaCode'>3</span>: <span class='tribes'>1</span></li> \
            <li><span class='areaCode'>8</span>: <span class='tribes'>2</span></li> \
            <li><span class='areaCode'>7</span>: <span class='tribes'>1</span></li> \
            <li><span class='areaCode'>5</span>: <span class='tribes'>1</span></li> \
            </ul>",
            onShown: disableNext,
            prev: -1,
            reflex: true,
        },
        {
            element: "#deck button.draw",
            title: "Event Card",
            placement: "top",
            content: "What will it be? <i>drum roll</i>",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay
        },
        {
            element: "#advancePhase .done:first",
            title: "Next Round",
            placement: "bottom",
            content: "No Event! Event Deck gods are favourable (or the tutorial \
            builder). On the other hand you cannot build anything right now. \
            So go on and cash in the huge amount of Tribes!",
            onShown: disableNext,
            reflex: true,
            prev: -1,
            onShow: function() {
                $("#advancePhase button").prop("disabled", true);
                $("#advancePhase button.done").prop("disabled", false);
            }
        },
        {
            element: "#changePrompt button:first",
            title: "Populate",
            placement: "bottom",
            content: "Noyce! Five Tribes. That's the record.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay
        },
        {
            element: "#rightAction .done:first",
            title: "Moving",
            placement: "bottom",
            content: "Now you are close of winning this Scenario. \
            Here's a wild idea: build the City to Region \
            <span class='areaCode'>4</span> now. Yes, it does not have \
            support (the farm) ... <i>yet</i>. You'll see...<br/> \
            Move tribes like this: \
            <ul> \
            <li><span class='areaCode'>4</span>: <span class='tribes'>4</span></li> \
            <li><span class='areaCode'>1</span>: <span class='tribes'>1</span></li> \
            <li><span class='areaCode'>3</span>: <span class='tribes'>1</span></li> \
            <li><span class='areaCode'>8</span>: <span class='tribes'>3</span></li> \
            <li><span class='areaCode'>7</span>: <span class='tribes'>1</span></li> \
            <li><span class='areaCode'>5</span>: <span class='tribes'>1</span></li> \
            </ul>",
            onShown: disableNext,
            prev: -1,
            reflex: true,
        },
        {
            element: "#deck button.draw",
            title: "Event Card",
            placement: "top",
            content: "Let's see if the plan sticks.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay
        },
        {
            element: "#card .event:first",
            title: "Event",
            placement: "top",
            content: "Before you draw the Region Card, pay attention \
            to the symbol (<span class='expr s'>s</span>) next to the Event name. \
            It tells you that a card draw and its Green Square Value will \
            determine the <strong>Population Loss</strong> \
            for the Epidemic.",
            prev: -1,
            onShow: function() {
                $("#deck .draw").addClass("hidden");
            }
        },
        {
            element: "#deck button.draw",
            title: "Region Card",
            placement: "top",
            content: "<strong>Epidemic</strong> starts from some Region and \
            spreads throughout your Empire. \
            First step is to find out the starting Region.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay,
            onShow: function() {
                $("#deck .draw").removeClass("hidden");
            }
        },
        {
            element: "#deck button.draw",
            title: "Population Loss",
            placement: "top",
            content: "The Epidemic spreads from Region <span class='areaCode'>7</span>. \
            The next card's Green Square will determine the Population Loss.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay+1000
        },
        {
            element: "#reducer h2",
            title: "Epidemic Reducer",
            placement: "bottom",
            content: "The <i>Common Reducer</i> now shows that you have to \
            reduce total of seven Tribes. It has already selected the starting \
            Region (<span class='areaCode'>7</span>) and thus you only have \
            six more to go (yikes!).",
            prev: -1,
            delay: delay+1500
        },
        {
            element: "#reducer .done",
            title: "Epidemic Reducer",
            placement: "bottom",
            content: "Luckily, you can steer the Epidemic through you Empire. \
            You cannot go to empty Regions but if the Epidemic ends up to a \
            deadend, it stops. You can try different paths with the Reducer. \
            Use \"Reset\" button to get back to the beginning. You can now try \
            to come up with the best solution in this situation. \
            The \"Done\" will be enabled when you find the right decision for this \
            tutorial. Normally it also gets enabled when you have reduced enough \
            Tribes.",
            onShown: disableNext,
            reflex: true,
        },
        {
            element: "#changePrompt button:first",
            title: "Populate",
            placement: "bottom",
            content: "You handled the Epidemic with quite small losses.",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay+500
        },
        {
            element: "#showTechTree",
            title: "Acquiring Advances",
            placement: "top",
            content: "Now you get to the most important part of the game: \
            <strong>Advances</strong>. You can open the <i>Tech Tree</i> \
            at any time by clicking this button. Do it now.",
            onShown: disableNext,
            reflex: true,
            prev: -1,
            onShow: function() {
                $("#showTechTree").removeAttr('style');
                $("#advancePhase button").prop("disabled", true);
            }
        },
        {
            element: "#techtree tab-heading:first",
            title: "Acquiring Advances",
            placement: "right",
            content: "You can acquire as many Advances as you have total City AV \
            in your Empire. Currently you have only one City with AV 1. If your \
            City AV will ever go below the amount of acquired Advances, you still \
            get to keep the Advances. You just can't acquire new ones before the \
            total AV is high enough again.",
            prev: -1,
            onShow: function() {
                $("#showTechTree").attr('style', 'pointer-events: none; opacity: 0.5');
            }
        },
        {
            element: "#techtree .tt_bottom",
            title: "Acquiring Advances",
            placement: "top",
            content: "All advances are listed here.<p>First in the list are Advances \
            that you can acquire with your current Tribes in alphabetical order.</p> \
            <p>Second are Advances with their required Advances acquired.</p> \
            From the list, find and click now the row of '<strong>Engineering</strong>'. \
            It is not acquirable at the moment so scroll down.",
            onShown: disableNext,
            onShow: function(tour) {
                $("#techtree tr:has(td:nth-child(2):contains('Engineering'))").one("click",
                function() {
                    tour.next();
                });
            }
        },
        {
            element: "#techtree #advanceinfo_tree",
            title: "Acquiring Advances",
            placement: "right",
            content: "In this area you see the <strong>Requirements</strong> for \
            the selected Advance. For example to acquire the \
            <strong>Engineering</strong>, you must \
            first acquire <strong>Masonry</strong>. Also, Engineering is \
            required to get Architecture. You can also navigate the \
            Advances by clicking their names.",
            prev: -1,
        },
        {
            element: "#techtree .advancecost",
            title: "Acquiring Advances",
            placement: "right",
            content: "Here is shown the <strong>Cost</strong> of the selected \
            Advance. Advance is always acquired in a Region with a City. Every \
            City can only acquire one Advance per round. So you have to plan your \
            Advances well. The Tribes for the Advance are taken from the acquiring \
            Region. Gold is reduced from the common stock. For example Engineering \
            would reduce three tribes from the Region acquiring it.",
        },
        {
            element: "#techtree .advanceres",
            title: "Acquiring Advances",
            placement: "right",
            content: "Advance also has <strong>Resource Requirements</strong>. \
            The acquiring Region must have these Resources, but they are <i>not</i> \
            decimated when the Advance is acquired. For example Engineering needs \
            to be acquired by a City in a Region with a Forest and a Mountain (or \
            Volcano).",
        },
        {
            element: "#techtree #advanceinfo_details",
            title: "Acquiring Advances",
            placement: "left",
            content: "This area explains what the Advance does and what Events \
            it affects. For example, with \
            Engineering you can raise your City AVs to maximum of three.\
            You can click some of the Events to see the Event \
            descriptions. Try to spot what is the Engineering effect on those. \
            Event descriptions will close from top right corner.",
        },
        {
            element: "#techtree .tt_bottom",
            title: "Acquiring Advances",
            placement: "top",
            content: "Advance Cost and Requirements are also shown in the list. \
            <p>Now, select Advance with the name \"Cartage\" (It is on top part of the list).</p>",
            onShown: disableNext,
            onShow: function(tour) {
                $("#techtree tr:has(td:nth-child(2):contains('Cartage'))").one("click",
                function() {
                    tour.next();
                });
            }
        },
        {
            element: "#techtree tr:has(td:nth-child(2):contains('Cartage')) td:first button",
            title: "Acquiring Advances",
            placement: "right",
            content: "By ticking this box you can pin the Advance to the toggle button. Pin the \"Cartage\" now.",
            onShown: disableNext,
            reflex: true,
            /*
            onShow: function(tour) {
                $("#techtree tr:has(td:nth-child(2):contains('Cartage')) td:first button").one("click",
                function() {
                    tour.next();
                });
            }
            */
        },
        {
            element: "#showTechTree",
            title: "Acquiring Advances",
            placement: "top",
            content: "As you can see, the pinned Advance is now \
            shown down here. This helps you when you plan your Tribe movement. \
            Close the Tech Tree by clicking this button again.",
            onShown: disableNext,
            reflex: true,
            prev: -1,
            onShow: function() {
                $("#showTechTree").removeAttr('style');
            }
        },
        {
            element: "#rightAction .advance-acquire",
            title: "Acquire Cartage",
            placement: "left",
            content: "Now, when you actually want to acquire the Advance and not \
            just plan acquiring it, you have to click \""+acquire.title+"\". It opens \
            the same Tech Tree but now with a possiblity to actually acquire \
            the Advances. You should now acquire <strong>Cartage</strong>.",
            onShown: disableNext,
            prev: -1,
            reflex: true,
            delay: delay,
            onShow: function() {
                $("#advancePhase button").prop("disabled", true);
                $("#advancePhase .advance-acquire").prop("disabled", false);
                $("#showTechTree").attr('style', 'pointer-events: none; opacity: 0.5');
            }
        },
        {
            element: "#techtree #advanceinfo_acquire button",
            title: "Acquire Cartage",
            placement: "right",
            content: "Cartage is already selected, and the correct Region \
            <span class='areaCode'>8</span> (with the required Mountain) is also \
            automatically selected from the right. \
            <p>Press the \"Acquire\" button now.</p>",
            onShown: disableNext,
            prev: -1,
            reflex: true,
        },
        {
            element: "#techtree #cityinfo tr.used",
            title: "Acquire Cartage",
            placement: "left",
            content: "The Region values are updated here.",
        },
        {
            element: "#techtree .resetter button",
            title: "Acquire Cartage",
            placement: "bottom",
            content: "You can review your changes and Reset the situation from \
            this button. But there is no need to do it now.",
        },
        {
            element: "#showTechTree",
            title: "Acquiring Advances",
            placement: "top",
            content: "When you now close the Tech Tree, you will lose the two \
            Tribes and gain the Cartage Advance. Oh yeah, Cartage lets you \
            use a Farm from another Region to give support to a City in \
            other Region. Do you see the plan already?",
            onShown: disableNext,
            reflex: true,
            onShow: function() {
                $("#showTechTree").removeAttr('style');
            }
        },
        {
            element: "#changePrompt button:first",
            title: "Cartage Acquired!",
            placement: "bottom",
            content: "Thus happened. You got the Cartage but lost two Tribes from \
            Region <span class='areaCode'>8</span>.",
            reflex: true,
            onShown: disableNext,
            onShow: function() {
                $("#advancePhase button").prop("disabled", true);
                $("#showTechTree").attr('style', 'pointer-events: none; opacity: 0.5');
            },
            prev: -1,
            delay: delay+500
        },
        {
            element: "table.advances td:first",
            title: "Cartage Acquired!",
            placement: "right",
            content: "You can see your acquired Advances also here.",
            delay: delay+500
        },
        {
            element: "#rightAction .advance-city",
            title: "Build a City",
            placement: "bottom",
            content: "Now you can build the City to Region \
            <span class='areaCode'>4</span> just as planned.",
            onShown: disableNext,
            prev: -1,
            reflex: true,
            onShow: function() {
                $("#advancePhase button").prop("disabled", true);
                $("#advancePhase .advance-city").prop("disabled", false);
            }
        },
        {
            element: "#reducer .done",
            title: "Build a City",
            placement: "bottom",
            content: "Select the Region and click \"Done\".",
            onShown: disableNext,
            prev: -1,
            reflex: true,
        },
        {
            element: "#changePrompt button:first",
            title: "Build a City",
            placement: "bottom",
            content: "Yippi-kay-ee! You built a City to Region \
            <span class='areaCode'>4</span>. Just like that!",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay+500
        },
        {
            element: "#advancePhase .done:first",
            title: "Upkeep",
            placement: "bottom",
            content: "You can now march to your sweet victory by going to the \
            Upkeep phase.",
            onShown: disableNext,
            reflex: true,
            prev: -1,
            onShow: function() {
                $("#advancePhase button").prop("disabled", true);
                $("#advancePhase button.done").prop("disabled", false);
            }
        },
        {
            element: "#reducer .done",
            title: "Reduce a City",
            placement: "bottom",
            content: "Oh right! You don't have enough support for your Cities. \
            Normally, you would have lost the City in Region \
            <span class='areaCode'>4</span> (no Farm). But because you have the \
            <strong>Cartage</strong>, you get to choose which City AV is \
            decreased (this destroys the City)! Remember, to win you \
            only need a City in Region <span class='areaCode'>4</span>. \
            <p>Select the desired Region from the Reducer or from the Map.",
            onShown: disableNext,
            prev: -1,
            reflex: true,
        },
        {
            element: "#changePrompt button:first",
            title: "Reduce a City",
            placement: "bottom",
            content: "Excellent choice!",
            reflex: true,
            onShown: disableNext,
            prev: -1,
            delay: delay+500
        },
        {
            element: "#gameover",
            title: "Victory!",
            placement: "bottom",
            content: "Congratulations! You did it! It wasn't so hard, wasn't it? \
            You can now try to tackle this Scenario without the tutorial. \
            This first Scenario is quite challenging so don't give up if your \
            Empire is destroyed during the first Event. Next Scenario tutorial will get you \
            to the Gold business. <i>Disclaimer: It is not implemented yet!</i> \
            <p><strong>Reload this page to end the tutorial properly!</strong></p>",
            onShown: disableNext,
            prev: -1,
        },
    ],
    "game": {
          "move": [
            { "1": 0, "2": 0, "3": 0, "4": 0, "5": 1, "7": 1, "8": 0 },
            { "1": 0, "2": 0, "3": 0, "4": 0, "5": 1, "7": 1, "8": 2 },
            { "1": 1, "2": 0, "3": 0, "4": 0, "5": 1, "7": 1, "8": 4 },
            { "1": 1, "2": 0, "3": 0, "4": 0, "5": 1, "7": 1, "8": 4 },
            { "1": 1, "2": 0, "3": 1, "4": 0, "5": 1, "7": 1, "8": 2 },
            { "1": 1, "2": 0, "3": 1, "4": 4, "5": 1, "7": 1, "8": 3 },
          ],
          "deck": [ 4, 2, 11, 10, 13, 6, 3, 5, 16, 7, 1 ],
          "reduce": [ [ 8 ], [ 8 ], [7, 5], [4], [8] ],
    },
}