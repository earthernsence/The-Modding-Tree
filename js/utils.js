/* eslint-disable no-negated-condition */
/* eslint-disable no-nested-ternary */
/* eslint-disable id-blacklist */
"use strict";

// ************ Big Feature related ************

function respecBuyables(layer) {
  if (!layers[layer].buyables) return;
  if (!layers[layer].buyables.respec) return;
  if (!confirm(`Are you sure you want to respec? This will force you to do a 
  "${tmp[layer].name ? tmp[layer].name : layer}" reset as well!`)) return;
  run(layers[layer].buyables.respec, layers[layer].buyables);
  updateBuyableTemp(layer);
  document.activeElement.blur();
}

function canAffordUpgrade(layer, id) {
  const upg = tmp[layer].upgrades[id];
  if (tmp[layer].upgrades[id].canAfford !== undefined) return tmp[layer].upgrades[id].canAfford;
  const cost = tmp[layer].upgrades[id].cost;
  return canAffordPurchase(layer, upg, cost);
}

function hasUpgrade(layer, id) {
  return (player[layer].upgrades.includes(toNumber(id)) || player[layer].upgrades.includes(id.toString()));
}

function hasMilestone(layer, id) {
  return (player[layer].milestones.includes(toNumber(id)) || player[layer].milestones.includes(id.toString()));
}

function hasAchievement(layer, id) {
  return (player[layer].achievements.includes(toNumber(id)) || player[layer].achievements.includes(id.toString()));
}

function hasChallenge(layer, id) {
  return (player[layer].challenges[id]);
}

function maxedChallenge(layer, id) {
  return (player[layer].challenges[id] >= tmp[layer].challenges[id].completionLimit);
}

function challengeCompletions(layer, id) {
  return (player[layer].challenges[id]);
}

function getBuyableAmount(layer, id) {
  return (player[layer].buyables[id]);
}

function setBuyableAmount(layer, id, amt) {
  player[layer].buyables[id] = amt;
}

function getClickableState(layer, id) {
  return (player[layer].clickables[id]);
}

function setClickableState(layer, id, state) {
  player[layer].clickables[id] = state;
}

function upgradeEffect(layer, id) {
  return (tmp[layer].upgrades[id].effect);
}

function challengeEffect(layer, id) {
  return (tmp[layer].challenges[id].rewardEffect);
}

function buyableEffect(layer, id) {
  return (tmp[layer].buyables[id].effect);
}

function clickableEffect(layer, id) {
  return (tmp[layer].clickables[id].effect);
}

function achievementEffect(layer, id) {
  return (tmp[layer].achievements[id].effect);
}

function canAffordPurchase(layer, thing, cost) {

  if (thing.currencyInternalName) {
    const name = thing.currencyInternalName;
    if (thing.currencyLocation) {
      return !(thing.currencyLocation[name].lt(cost));
    }
    if (thing.currencyLayer) {
      const lr = thing.currencyLayer;
      return !(player[lr][name].lt(cost));
    }
    
    return !(player[name].lt(cost));
  }
  return !(player[layer].points.lt(cost));
}

function buyUpgrade(layer, id) {
  buyUpg(layer, id);
}

function buyUpg(layer, id) {
  if (!tmp[layer].upgrades || !tmp[layer].upgrades[id]) return;
  const upg = tmp[layer].upgrades[id];
  if (!player[layer].unlocked) return;
  if (!tmp[layer].upgrades[id].unlocked) return;
  if (player[layer].upgrades.includes(id)) return;
  if (upg.canAfford === false) return;
  const pay = layers[layer].upgrades[id].pay;
  if (pay !== undefined)
    run(pay, layers[layer].upgrades[id]);
  else {
    const cost = tmp[layer].upgrades[id].cost;

    if (upg.currencyInternalName) {
      const name = upg.currencyInternalName;
      if (upg.currencyLocation) {
        if (upg.currencyLocation[name].lt(cost)) return;
        upg.currencyLocation[name] = upg.currencyLocation[name].sub(cost);
      } else if (upg.currencyLayer) {
        const lr = upg.currencyLayer;
        if (player[lr][name].lt(cost)) return;
        player[lr][name] = player[lr][name].sub(cost);
      } else {
        if (player[name].lt(cost)) return;
        player[name] = player[name].sub(cost);
      }
    } else {
      if (player[layer].points.lt(cost)) return;
      player[layer].points = player[layer].points.sub(cost);
    }
  }
  player[layer].upgrades.push(id);
  if (upg.onPurchase !== undefined)
    run(upg.onPurchase, upg);
}

function buyMaxBuyable(layer, id) {
  if (!player[layer].unlocked) return;
  if (!tmp[layer].buyables[id].unlocked) return;
  if (!tmp[layer].buyables[id].canAfford) return;
  if (!layers[layer].buyables[id].buyMax) return;

  run(layers[layer].buyables[id].buyMax, layers[layer].buyables[id]);
  updateBuyableTemp(layer);
}

function buyBuyable(layer, id) {
  if (!player[layer].unlocked) return;
  if (!tmp[layer].buyables[id].unlocked) return;
  if (!tmp[layer].buyables[id].canAfford) return;

  run(layers[layer].buyables[id].buy, layers[layer].buyables[id]);
  updateBuyableTemp(layer);
}

function clickClickable(layer, id) {
  if (!player[layer].unlocked) return;
  if (!tmp[layer].clickables[id].unlocked) return;
  if (!tmp[layer].clickables[id].canClick) return;

  run(layers[layer].clickables[id].onClick, layers[layer].clickables[id]);
  updateClickableTemp(layer);
}

// Function to determine if the player is in a challenge
function inChallenge(layer, id) {
  const challenge = player[layer].activeChallenge;
  if (!challenge) return false;
  id = toNumber(id);
  if (challenge === id) return true;

  if (layers[layer].challenges[challenge].countsAs)
    return tmp[layer].challenges[challenge].countsAs.includes(id);
}

// ************ Misc ************

const onTreeTab = true;
function showTab(name) {
  if (LAYERS.includes(name) && !layerunlocked(name)) return;
  if (player.tab === name && isPlainObject(tmp[name].tabFormat)) {
    player.subtabs[name].mainTabs = Object.keys(layers[name].tabFormat)[0];
  }
  const toTreeTab = name === "none";
  player.tab = name;
  if (player.navTab === "none" && (tmp[name].row !== "side") && (tmp[name].row !== "otherside")) player.lastSafeTab = name;
  delete player.notify[name];
  needCanvasUpdate = true;
  document.activeElement.blur();
}

function showNavTab(name) {
  if (LAYERS.includes(name) && !layerunlocked(name)) return;

  const toTreeTab = name === "tree";
  player.navTab = name;
  player.notify[name] = false;
  needCanvasUpdate = true;
}


function goBack() {
  if (player.navTab !== "none") showTab("none");
  else showTab(player.lastSafeTab);
}

function layOver(obj1, obj2) {
  for (const x in obj2) {
    if (obj2[x] instanceof Decimal) obj1[x] = new Decimal(obj2[x]);
    else if (obj2[x] instanceof Object) layOver(obj1[x], obj2[x]);
    else obj1[x] = obj2[x];
  }
}

function prestigeNotify(layer) {
  if (layers[layer].prestigeNotify) return layers[layer].prestigeNotify();
  if (tmp[layer].autoPrestige || tmp[layer].passiveGeneration) return false;
  if (tmp[layer].type === "static") return tmp[layer].canReset;
  if (tmp[layer].type === "normal") return (tmp[layer].canReset && (tmp[layer].resetGain.gte(player[layer].points.div(10))));
  return false;
}

function notifyLayer(name) {
  if (player.tab === name || !layerunlocked(name)) return;
  player.notify[name] = 1;
}

function subtabShouldNotify(layer, family, id) {
  let subtab = {};
  if (family === "mainTabs") subtab = tmp[layer].tabFormat[id];
  else subtab = tmp[layer].microtabs[family][id];

  if (subtab.embedLayer) return tmp[subtab.embedLayer].notify;
  return subtab.shouldNotify;
}

function subtabResetNotify(layer, family, id) {
  let subtab = {};
  if (family === "mainTabs") subtab = tmp[layer].tabFormat[id];
  else subtab = tmp[layer].microtabs[family][id];
  if (subtab.embedLayer) return tmp[subtab.embedLayer].prestigeNotify;
  return false;
}

function nodeShown(layer) {
  if (layerShown(layer)) return true;
  switch (layer) {
  case "idk":
    return player.idk.unlocked;
  }
  return false;
}

function layerunlocked(layer) {
  if (tmp[layer] && tmp[layer].type === "none") return (player[layer].unlocked);
  return LAYERS.includes(layer) && (player[layer].unlocked || (tmp[layer].canReset && tmp[layer].layerShown));
}

function keepGoing() {
  player.keepGoing = true;
  needCanvasUpdate = true;
}

function toNumber(x) {
  if (x.mag !== undefined) return x.toNumber();
  if (x + 0 !== x) return parseFloat(x);
  return x;
}

function updateMilestones(layer) {
  for (id in layers[layer].milestones) {
    if (!(hasMilestone(layer, id)) && layers[layer].milestones[id].done()) {
      player[layer].milestones.push(id);
      if (tmp[layer].milestonePopups || tmp[layer].milestonePopups === undefined) doPopup("milestone", tmp[layer].milestones[id].requirementDescription, "Milestone Gotten!", 3, tmp[layer].color);
    }
  }
}

function updateAchievements(layer) {
  for (id in layers[layer].achievements) {
    if (isPlainObject(layers[layer].achievements[id]) && !(hasAchievement(layer, id)) && layers[layer].achievements[id].done()) {
      player[layer].achievements.push(id);
      if (layers[layer].achievements[id].onComplete) layers[layer].achievements[id].onComplete();
      if (tmp[layer].achievementPopups || tmp[layer].achievementPopups === undefined) doPopup("achievement", tmp[layer].achievements[id].name, "Achievement Gotten!", 3, tmp[layer].color);
    }
  }
}

function addTime(diff, layer) {
  let data = player;
  let time = data.timePlayed;
  if (layer) {
    data = data[layer];
    time = data.time;
  }

  // I am not that good to perfectly fix that leak. ~ DB Aarex
  if (time + 0 !== time) {
    console.log("Memory leak detected. Trying to fix...");
    time = toNumber(time);
    if (isNaN(time) || time === 0) {
      console.log("Couldn't fix! Resetting...");
      time = layer ? player.timePlayed : 0;
      if (!layer) player.timePlayedReset = true;
    }
  }
  time += toNumber(diff);

  if (layer) data.time = time;
  else data.timePlayed = time;
}

document.onkeydown = function(e) {
  if (player === undefined) return;
  if (gameEnded && !player.keepGoing) return;
  const shiftDown = e.shiftKey;
  const ctrlDown = e.ctrlKey;
  let key = e.key;
  if (ctrlDown) key = `ctrl+${key}`;
  if (onFocused) return;
  if (ctrlDown && hotkeys[key]) e.preventDefault();
  if (hotkeys[key]) {
    if (player[hotkeys[key].layer].unlocked)
      hotkeys[key].onPress();
  }
};

let onFocused = false;
function focused(x) {
  onFocused = x;
}

function prestigeButtonText(layer) {
  if (layers[layer].prestigeButtonText !== undefined)
    return layers[layer].prestigeButtonText();
  if (tmp[layer].type === "normal")
    return `${player[layer].points.lt(1e3) ? (tmp[layer].resetDescription !== undefined
      ? tmp[layer].resetDescription : "Reset for ") : ""}+<b>${formatWhole(tmp[layer].resetGain)}
</b> ${tmp[layer].resource} ${tmp[layer].resetGain.lt(100) && player[layer].points.lt(1e3)
  ? `<br><br>Next at ${(tmp[layer].roundUpCost ? formatWhole(tmp[layer].nextAt) : format(tmp[layer].nextAt))}
${tmp[layer].baseResource}` : ""}`;
  if (tmp[layer].type === "static")
    return `${tmp[layer].resetDescription !== undefined ? tmp[layer].resetDescription : "Reset for "}
+<b>${formatWhole(tmp[layer].resetGain)}</b> ${tmp[layer].resource}<br><br>${player[layer].points.lt(30
) ? (tmp[layer].baseAmount.gte(tmp[layer].nextAt) && (tmp[layer].canBuyMax !== undefined) &&
tmp[layer].canBuyMax ? "Next:" : "Req:") : ""} ${formatWhole(tmp[layer].baseAmount)}
/ ${(tmp[layer].roundUpCost ? formatWhole(tmp[layer].nextAtDisp) : format(tmp[layer].nextAtDisp))}
${tmp[layer].baseResource}`;
  if (tmp[layer].type === "none")
    return "";
  return "You need prestige button text";
}

function isFunction(obj) {
  return Boolean(obj && obj.constructor && obj.call && obj.apply);
}

function isPlainObject(obj) {
  return (Boolean(obj)) && (obj.constructor === Object);
}

document.title = modInfo.name;


// Variables that must be defined to display popups
let activePopups = [];
let popupID = 0;

// Function to show popups
function doPopup(type = "none", text = "This is a test popup.", title = "", timer = 3, color = "") {
  switch (type) {
  case "achievement":
    popupTitle = "Achievement Unlocked!";
    popupType = "achievement-popup";
    break;
  case "challenge":
    popupTitle = "Challenge Complete";
    popupType = "challenge-popup";
			break;
		case "onload":
			popupTitle = "Welcome to Cutlery Incremental!";
			popupType = "default-popup";
			break;
  default:
    popupTitle = "Something Happened?";
    popupType = "default-popup";
    break;
  }
  if (title !== "") popupTitle = title;
  popupMessage = text;
  popupTimer = timer;

  // eslint-disable-next-line max-len
  activePopups.push({ "time": popupTimer, "type": popupType, "title": popupTitle, "message": (`${popupMessage}\n`), "id": popupID, color });
  popupID++;
}


// Function to reduce time on active popups
function adjustPopupTime(diff) {
  for (popup in activePopups) {
    activePopups[popup].time -= diff;
    if (activePopups[popup].time < 0) {
      activePopups.splice(popup, 1);
      // Remove popup when time hits 0
    }
  }
}

function run(func, target, args = null) {
  if (func && func.constructor && func.call && func.apply) {
    const bound = func.bind(target);
    return bound(args);
  }
  return func;
}