/*
Copyright � 2015 that_shaman
This work is free. You can redistribute it and/or modify it under the
terms of the Do What The Fuck You Want To Public License, Version 2,
as published by Sam Hocevar. See http://www.wtfpl.net/ for more details.
*/

function sortFunction(a, b)
{
    return a[0] > b[0];
}

function toGW2Code(input)
{
    var buffer = "";

    for (r = 0; r < input.length; r++)
    {
        buffer += String.fromCharCode(input[r]);
    }

    return "[&" + btoa(buffer) + "]";
}

function idToGW2Code(id)
{
    var A = Math.floor(id / 256);
    var B = id - (A * 256);

    return toGW2Code(new Array(2, 1, B, A, 0, 0));
}

function RGBtoXYZ(r, g, b)
{
    var var_R = (r / 255);
    var var_G = (g / 255);
    var var_B = (b / 255);

    if (var_R > 0.04045) var_R = Math.pow(((var_R + 0.055) / 1.055), 2.4);
    else var_R = var_R / 12.92;

    if (var_G > 0.04045) var_G = Math.pow(((var_G + 0.055) / 1.055), 2.4);
    else var_G = var_G / 12.92;

    if (var_B > 0.04045) var_B = Math.pow(((var_B + 0.055) / 1.055), 2.4);
    else var_B = var_B / 12.92;

    X = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805;
    Y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722;
    Z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505;

    var_X = X / 95.047;
    var_Y = Y / 100.000;
    var_Z = Z / 108.883;

    if (var_X > 0.008856) var_X = Math.pow(var_X, (1 / 3));
    else var_X = (7.787 * var_X) + (16 / 116);
    if (var_Y > 0.008856) var_Y = Math.pow(var_Y, (1 / 3));
    else var_Y = (7.787 * var_Y) + (16 / 116);
    if (var_Z > 0.008856) var_Z = Math.pow(var_Z, (1 / 3));
    else var_Z = (7.787 * var_Z) + (16 / 116);

    return [var_X, var_Y, var_Z];
}

function RGBtoLAB(r, g, b)
{
    var var_R = (r / 255);
    var var_G = (g / 255);
    var var_B = (b / 255);

    if (var_R > 0.04045) var_R = Math.pow(((var_R + 0.055) / 1.055), 2.4);
    else var_R = var_R / 12.92;

    if (var_G > 0.04045) var_G = Math.pow(((var_G + 0.055) / 1.055), 2.4);
    else var_G = var_G / 12.92;

    if (var_B > 0.04045) var_B = Math.pow(((var_B + 0.055) / 1.055), 2.4);
    else var_B = var_B / 12.92;

    X = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805;
    Y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722;
    Z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505;

    var_X = X / 95.047;
    var_Y = Y / 100.000;
    var_Z = Z / 108.883;

    if (var_X > 0.008856) var_X = Math.pow(var_X, (1 / 3));
    else var_X = (7.787 * var_X) + (16 / 116);
    if (var_Y > 0.008856) var_Y = Math.pow(var_Y, (1 / 3));
    else var_Y = (7.787 * var_Y) + (16 / 116);
    if (var_Z > 0.008856) var_Z = Math.pow(var_Z, (1 / 3));
    else var_Z = (7.787 * var_Z) + (16 / 116);

    L = (116 * var_Y) - 16;
    a = 500 * (var_X - var_Y);
    b = 200 * (var_Y - var_Z);

    return [L, a, b];
}

$(document).ready(function ()
{
    $("#picker").spectrum({
        flat: true,
        showInput: true,
        change: function (color)
        {
            updateFromColor(jQuery.Color(color.toHexString()));
        }
    });

    $("#picker").on("dragstop.spectrum", function (e, color)
    {
        updateFromColor(jQuery.Color(color.toHexString()));
    });

    updateFromColor(jQuery.Color("#e3b756"));
});

function getNearest(target, method)
{
    method = typeof method !== 'undefined' ? method : "combo";
    var targetRes = [];
    var targetLab = RGBtoLAB(target.red(), target.green(), target.blue());
    var targetXyz = RGBtoXYZ(target.red(), target.green(), target.blue());

    $('#outputDiv').children().remove();

    $.each(colors, function (key, value)
    {
        var color = jQuery.Color(colors[key].metal.rgb);
        var val = new Array();

        if (method == "hsl")
        {
            var _h = (target.hue() - color.hue()) / 360;
            var _s = target.saturation() - color.saturation();
            var _l = target.lightness() - color.lightness();

            if (_h < 0) _h *= -1;
            if (_s < 0) _s *= -1;
            if (_l < 0) _l *= -1;
            val[0] = (_h * 0.475) + (_l * 0.2875) + (_s * 0.2375);
        }
        else if (method == "rgb")
        {
            val[0] = Math.sqrt(Math.pow((target.red() - color.red()), 2) + Math.pow((target.green() - color.green()), 2) + Math.pow((target.blue() - color.blue()), 2));
        }
        else if (method == "lab")
        {
            var lab = RGBtoLAB(color.red(), color.green(), color.blue());
            val[0] = Math.sqrt(Math.pow(lab[0] - targetLab[0], 2) + Math.pow(lab[1] - targetLab[1], 2) + Math.pow(lab[2] - targetLab[2], 2));
        }
        else if (method == "combo")
        {
            var lab = RGBtoLAB(color.red(), color.green(), color.blue());
            val[0] = 0;
            val[0] += Math.sqrt(Math.pow((target.red() - color.red()), 2) + Math.pow((target.green() - color.green()), 2) + Math.pow((target.blue() - color.blue()), 2));
            val[0] += Math.sqrt(Math.pow(lab[0] - targetLab[0], 2) + Math.pow(lab[1] - targetLab[1], 2) + Math.pow(lab[2] - targetLab[2], 2)) * 11.3;
        }
        else if (method == "xyz")
        {
            var xyz = RGBtoXYZ(color.red(), color.green(), color.blue());
            val[0] = Math.sqrt(Math.pow(xyz[0] - targetXyz[0], 2) + Math.pow(xyz[1] - targetXyz[1], 2) + Math.pow(xyz[2] - targetXyz[2], 2));
        }

        val[1] = key;

        targetRes.push(val);

    });

    targetRes.sort(function (a, b)
    {
        return a[0] - b[0];
    });

    return targetRes;
}

function updateFromColor(color)
{
    var base = getNearest(color);
    var p = 1.0 / 256.0;

    var comp = getNearest(color.hue("-=180").lightness(1 - color.lightness()));

          
    for (var i = 0; i < 5; i++)
    {
        var div = $('<div/>', {
            html: "<span style='font-size: 14pt'><img src='http://wiki.guildwars2.com/images/a/a9/Square_Fine_Dye.png' style='width: 40px; height:40px; float:left; padding-right: 5px'/> " + colors[base[i][1]].name + "</span><br/>" + idToGW2Code(dyenames[colors[base[i][1]].name])
        }).css('background-color', colors[base[i][1]].metal.rgb).addClass("dye").attr("data-colorid", base[i][1]);

        div.dblclick(function ()
        {
            var color = jQuery.Color(colors[$(this).data("colorid")].metal.rgb);
            $("#picker").spectrum("set", color.toHexString());
            updateFromColor(color);
        });


        div.appendTo('#outputDiv');
    }

    for (var i = 0; i < 3; i++)
    {
        var div = $('<div/>', {
            html: "<img src='http://wiki.guildwars2.com/images/a/a9/Square_Fine_Dye.png' style='width: 40px; height:40px; float:left; padding-right: 5px'/> " + colors[comp[i][1]].name + "<br/>" + idToGW2Code(dyenames[colors[comp[i][1]].name])
        }).css('background-color', colors[comp[i][1]].metal.rgb).addClass("dye").attr("data-colorid", comp[i][1]);

        div.dblclick(function ()
        {
            var color = jQuery.Color(colors[$(this).data("colorid")].metal.rgb);
            $("#picker").spectrum("set", color.toHexString());
            updateFromColor(color);
        });

        div.appendTo('#outputDiv');
    }
}

var dyenames = {
    "Abyss": 20356,
    "Ash": 20357,
    "Black": 20358,
    "Celestial": 20359,
    "Chalk": 20360,
    "Graphite": 20361,
    "Dust": 20362,
    "Gray": 20363,
    "Icing": 20364,
    "Robin": 20365,
    "Pitch": 20366,
    "Blue Rose": 20367,
    "Ocean": 20368,
    "Starry Night": 20369,
    "Sky": 20370,
    "Celery": 20371,
    "Demure": 20372,
    "Night Air": 20373,
    "Flush": 20374,
    "Sand": 20375,
    "Lemon Zest": 20376,
    "Quickstalk": 20377,
    "Shy Peach": 20378,
    "Tang": 20379,
    "Dapple": 20380,
    "Dewdrop": 20381,
    "Hush": 20382,
    "Mist": 20383,
    "Orange Frost": 20384,
    "Scenic": 20385,
    "Spring": 20386,
    "Strawberry Cream": 20387,
    "Adobe": 20388,
    "Latte": 20389,
    "Cashmere": 20390,
    "Mohair": 20391,
    "Cocoa": 20392,
    "Wheat": 20393,
    "Shale": 20394,
    "Royal Blue": 20395,
    "Calfskin": 20397,
    "Chocolate": 20398,
    "Marine": 20400,
    "Terracotta": 20402,
    "Breeze": 20403,
    "Taro": 20404,
    "Wintermint": 20405,
    "Beige": 20406,
    "Charcoal": 20408,
    "Earthen": 20410,
    "Ivory": 20411,
    "Mahogany": 20412,
    "Mocha": 20413,
    "Natural": 20414,
    "Rawhide": 20415,
    "Taupe": 20416,
    "Walnut": 20417,
    "Blueberry": 20418,
    "Sapphire": 20419,
    "Autumn Sky": 20420,
    "Amber": 20421,
    "Grapesicle": 20422,
    "Emerald": 20423,
    "Fern": 20424,
    "Copper Pot": 20425,
    "Antique Bronze": 20426,
    "Oxblood": 20427,
    "Dusky": 20428,
    "Dusty Grape": 20429,
    "Shy Iris": 20430,
    "Pumpkin Pie": 20431,
    "Tangerine": 20432,
    "Leprechaun": 20433,
    "Bronze": 20434,
    "Mithril": 20435,
    "Blush": 20436,
    "Peach Sunset": 20437,
    "Country Blue": 20438,
    "Evening": 20439,
    "Old Jeans": 20440,
    "Crush": 20441,
    "Peanut Butter": 20442,
    "Squash": 20443,
    "Clove": 20444,
    "Ceylon": 20445,
    "Kelly": 20446,
    "Summer Grass": 20447,
    "Antique Olive": 20448,
    "Copper": 20449,
    "Gunmetal": 20450,
    "Oil Slick": 20451,
    "Summer Sky": 20452,
    "Bold": 20453,
    "Peach": 20454,
    "Denim": 20455,
    "Brandywine": 20456,
    "Country Teal": 20457,
    "Eucalyptus": 20458,
    "Frosted Sea": 20459,
    "Night Iris": 20460,
    "Shy Blue": 20461,
    "Moss": 20464,
    "Pumpkin": 20465,
    "Remembrance": 20466,
    "Warmth": 20467,
    "Butter": 20468,
    "Honey": 20469,
    "Green Apple": 20470,
    "Crisp Mint": 20471,
    "Grass": 20472,
    "Key Lime": 20473,
    "Spearmint": 20474,
    "Antique Gold": 20476,
    "Brass": 20477,
    "Burnished Steel": 20478,
    "Copper Penny": 20479,
    "Gold": 20480,
    "Iron": 20481,
    "Mudmetal": 20482,
    "Old Penny": 20483,
    "Midnight Purple": 20484,
    "Silt": 20485,
    "Chalkboard": 20486,
    "Cinnamon": 20487,
    "Mushroom": 20488,
    "Wintergreen": 20489,
    "Lipstick": 20490,
    "White Gold": 20491,
    "Avocado": 20492,
    "Green Shade": 20493,
    "Pink Tint": 20494,
    "Wine Shade": 20495,
    "Burgundy": 20496,
    "Brick": 20497,
    "Grape Gum": 20498,
    "Steel": 20499,
    "Midnight Gold": 20500,
    "Midnight Sky": 20501,
    "Tarnish": 20502,
    "Far Mountain": 20503,
    "Lemon Tint": 20504,
    "Olive Tint": 20505,
    "Rose Shade": 20506,
    "Truffle": 20507,
    "Pine": 20508,
    "Indigo": 20509,
    "Scarlet": 20510,
    "Lime": 20511,
    "Sea Green": 20512,
    "Periwinkle": 20513,
    "Caramel": 20514,
    "Rust": 20515,
    "Midnight Fire": 20517,
    "Midnight Ice": 20518,
    "Midnight Rose": 20519,
    "Midnight Violet": 20520,
    "Khaki": 20521,
    "Blue Shade": 20522,
    "Cream Shade": 20523,
    "Frosting": 20524,
    "Hint": 20525,
    "Olive Shade": 20527,
    "Pale": 20528,
    "Refresh": 20529,
    "Sage": 20530,
    "Whisper": 20532,
    "Grape Leaf": 20533,
    "Orange": 20534,
    "Sunset": 20535,
    "Pink": 20537,
    "Fuchsia": 20538,
    "Evergreen": 20539,
    "Wasabi": 20540,
    "Spruce": 20542,
    "Iris": 20543,
    "Wine": 20544,
    "Plum": 20545,
    "Lemon": 20546,
    "Pewter": 20547,
    "Silver": 20548,
    "Swamp Grass": 20549,
    "Tungsten": 20550,
    "Midnight Blue": 20551,
    "Midnight Fuchsia": 20552,
    "Midnight Green": 20553,
    "Midnight Olive": 20554,
    "Midnight Red": 20555,
    "Midnight Rust": 20556,
    "Midnight Teal": 20557,
    "Midnight Yew": 20558,
    "Chartreuse": 20559,
    "Patina": 20560,
    "Aqua Tint": 20561,
    "Blue Tint": 20562,
    "Cream": 20563,
    "Dusk": 20564,
    "Frost": 20565,
    "Grape Shade": 20566,
    "Green Tint": 20567,
    "Lemon Shade": 20568,
    "Malt": 20569,
    "Mint Frost": 20570,
    "Night Shade": 20571,
    "Olive Silk": 20572,
    "Orange Shade": 20573,
    "Peach Tint": 20574,
    "Purple Tint": 20575,
    "Riverbed": 20576,
    "Rose Tint": 20577,
    "Shy Violet": 20578,
    "Silver Lead": 20579,
    "Tea Shade": 20580,
    "Violet Tint": 20581,
    "White": 20582,
    "Olive": 20583,
    "Olive Oil": 20584,
    "Olive Yew": 20585,
    "Creamsicle": 20587,
    "Grapevine": 20588,
    "Iris Blush": 20589,
    "Thistle": 20590,
    "Coral": 20591,
    "Ruby": 20592,
    "Cotton Candy": 20593,
    "Hot Pink": 20594,
    "Maroon": 20595,
    "Sprout": 20597,
    "Cantaloupe": 20599,
    "Sherbert": 20600,
    "Seafoam": 20601,
    "Turquoise": 20602,
    "Violet": 20603,
    "Lilac": 20604,
    "Royal Purple": 20605,
    "Grape": 20606,
    "Morning Glory": 20607,
    "Butterscotch": 20608,
    "Harvest Gold": 20609,
    "Lemonade": 20610,
    "Zest": 20611,
    "Envy": 20612,
    "Afternoon": 20613,
    "Brook": 20614,
    "Cherry": 20615,
    "Dark Chocolate": 20616,
    "Evening Red": 20617,
    "Evening Wine": 20618,
    "Grapefruit": 20619,
    "Hazel": 20620,
    "Heather": 20621,
    "Honey Ice": 20622,
    "Lifesblood": 20623,
    "Mint": 20624,
    "Mint Ice": 20625,
    "Mullberry": 20626,
    "Nectar": 20627,
    "Nickel": 20628,
    "Nightsong": 20629,
    "Pastel Blue": 20630,
    "Pastel Citrus": 20631,
    "Pastel Lime": 20632,
    "Pastel Wine": 20633,
    "Pastel Winter": 20634,
    "Purple": 20635,
    "Purple Ice": 20636,
    "Rich Grape": 20637,
    "Sea Frost": 20638,
    "Sour Apple": 20639,
    "Sprig": 20640,
    "Sunrise Breeze": 20641,
    "Teal": 20642,
    "Violet Breeze": 20643,
    "Viridian": 20644,
    "Wine Breeze": 20645,
    "Winter Ice": 20646,
    "Ancient Silver": 20647,
    "Black Cherry": 20648,
    "Blue Sky": 20649,
    "Cobalt": 20650,
    "Deep Lilac": 20651,
    "Evening Grass": 20652,
    "Lead": 20653,
    "Primrose": 20654,
    "Purple Breeze": 20655,
    "Regal": 20656,
    "Spring Grass": 20657,
    "Tarnished Silver": 20658,
    "Adobe Sunset": 20659,
    "Banana": 20660,
    "Blue Ice": 20661,
    "Blurple": 20662,
    "Chestnut": 20663,
    "Citrus Breeze": 20664,
    "Citrus": 20665,
    "Citrus Ice": 20666,
    "Cucumber": 20667,
    "Daffodil": 20668,
    "Dark Olive": 20669,
    "Deep Pine": 20671,
    "Deep Teal": 20672,
    "Fluff": 20673,
    "Fog": 20674,
    "Fresh Green": 20675,
    "Freshen": 20676,
    "Frost Breeze": 20677,
    "Green": 20679,
    "Heliotrope": 20680,
    "Honeybutter": 20681,
    "Honeysuckle": 20682,
    "Humiliation": 20683,
    "Hydrangea": 20684,
    "Lavender": 20685,
    "Lemon Ice": 20686,
    "Lime Breeze": 20687,
    "Lime Ice": 20688,
    "Melon": 20690,
    "Midday": 20691,
    "Mint Breeze": 20692,
    "Mintay": 20693,
    "Morning Sea": 20694,
    "Old Nickel": 20695,
    "Olive Ice": 20696,
    "Orangespring": 20697,
    "Papaya": 20698,
    "Pastel Honey": 20699,
    "Pastel Lemon": 20700,
    "Pastel Mint": 20701,
    "Pastel Olive": 20702,
    "Pastel Peach": 20703,
    "Pastel Pink": 20704,
    "Pastel Purple": 20705,
    "Pastel Rose": 20706,
    "Pastel Sea": 20707,
    "Pastel Spring": 20708,
    "Pastel Violet": 20709,
    "Peach Ice": 20710,
    "Persephone": 20711,
    "Phlox": 20712,
    "Pink Ice": 20713,
    "Red": 20714,
    "River": 20715,
    "Root": 20716,
    "Rose Breeze": 20717,
    "Rose Ice": 20718,
    "Sea Breeze": 20720,
    "Sea Ice": 20721,
    "Shy Lilac": 20722,
    "Shylac": 20723,
    "Sienna": 20724,
    "Sour": 20725,
    "Spring Breeze": 20726,
    "Spring Dew": 20727,
    "Spring Ice": 20728,
    "Spring Leaf": 20729,
    "Spring Moss": 20730,
    "Spring Tide": 20731,
    "Stem": 20732,
    "Strawberry Breeze": 20733,
    "Strawberry": 20734,
    "Summer Thistle": 20736,
    "Tulip": 20737,
    "Umber": 20738,
    "Veronica": 20739,
    "Violet Ice": 20740,
    "Winter Breeze": 20741,
    "Winter Frost": 20742,
    "Buttercream": 20743,
    "Cornsilk": 20744,
    "Mountain Sky": 20745,
    "Wine Ice": 20746,
    "Heirloom": 20747,
    "Wrath": 20748,
    "Sincerity": 20749,
    "Mischief": 20750,
    "Blood": 20751,
    "Redemption": 20752,
    "Illumination": 20753,
    "Spitfire": 20754,
    "Lava": 20755,
    "Spite": 20756,
    "Forgiveness": 20757,
    "Pride": 20758,
    "Arrogance": 20759,
    "Deep Glacial Teal": 41746,
    "Glacial Teal": 41747,
    "Shiver Sea": 41748,
    "Deep Glacial Sky": 41749,
    "Glacial Sky": 41750,
    "Shiver Sky": 41751,
    "Flame": 41752,
    "Molten": 41753,
    "Pyre": 41754,
    "Flare": 41755,
    "Cinders": 41756,
    "Charred": 41757,
    "Swampblack": 47901,
    "Caustic": 47902,
    "Toxin": 47903,
    "Algae": 47904,
    "Acid": 47905,
    "Acrid": 47906,
    "Blacklight": 48924,
    "Cobolt": 48925,
    "Cyanide": 48926,
    "Limonite": 48927,
    "Vincent": 48928,
    "Violite": 48929,
    "Amenity": 49525,
    "Fling": 49526,
    "Onset": 49527,
    "Perseverance": 49528,
    "Prosperity": 49529,
    "Recall": 49530,
    "Enameled Legacy": 64198,
    "Enameled Sky": 64199,
    "Enameled Reign": 64200,
    "Enameled Jungle": 64201,
    "Enameled Crimson": 64202,
    "Enameled Emblaze": 64203
};


var colors = {
    "668": {
        "name": "Pink Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 50,
            "contrast": 1.36719,
            "hue": 8,
            "saturation": 0.351563,
            "lightness": 1.36719,
            "rgb": [
                216,
                172,
                164
            ]
        },
        "leather": {
            "brightness": 47,
            "contrast": 1.71875,
            "hue": 8,
            "saturation": 0.234375,
            "lightness": 1.71875,
            "rgb": [
                207,
                170,
                163
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 8,
            "saturation": 0.429688,
            "lightness": 1.48438,
            "rgb": [
                211,
                145,
                134
            ]
        }
    },
    "657": {
        "name": "Pastel Pink",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 52,
            "contrast": 1.40625,
            "hue": 8,
            "saturation": 0.585938,
            "lightness": 1.40625,
            "rgb": [
                247,
                170,
                157
            ]
        },
        "leather": {
            "brightness": 52,
            "contrast": 1.40625,
            "hue": 8,
            "saturation": 0.546875,
            "lightness": 1.40625,
            "rgb": [
                243,
                172,
                159
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.5625,
            "hue": 8,
            "saturation": 0.546875,
            "lightness": 1.40625,
            "rgb": [
                220,
                141,
                126
            ]
        }
    },
    "699": {
        "name": "Strawberry Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 44,
            "contrast": 1.17188,
            "hue": 5,
            "saturation": 0.78125,
            "lightness": 1.32813,
            "rgb": [
                243,
                154,
                145
            ]
        },
        "leather": {
            "brightness": 47,
            "contrast": 1.36719,
            "hue": 5,
            "saturation": 0.585938,
            "lightness": 1.40625,
            "rgb": [
                235,
                158,
                150
            ]
        },
        "metal": {
            "brightness": 35,
            "contrast": 1.48438,
            "hue": 5,
            "saturation": 0.585938,
            "lightness": 1.40625,
            "rgb": [
                195,
                111,
                102
            ]
        }
    },
    "669": {
        "name": "Primrose",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.17188,
            "hue": 5,
            "saturation": 0.859375,
            "lightness": 1.28906,
            "rgb": [
                225,
                128,
                118
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.17188,
            "hue": 5,
            "saturation": 0.703125,
            "lightness": 1.28906,
            "rgb": [
                213,
                133,
                125
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.40625,
            "hue": 5,
            "saturation": 0.703125,
            "lightness": 1.28906,
            "rgb": [
                191,
                95,
                85
            ]
        }
    },
    "121": {
        "name": "Pink",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 27,
            "contrast": 1.28906,
            "hue": 355,
            "saturation": 0.703125,
            "lightness": 1.40625,
            "rgb": [
                194,
                97,
                106
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.36719,
            "hue": 355,
            "saturation": 0.664063,
            "lightness": 1.52344,
            "rgb": [
                212,
                115,
                124
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.32813,
            "hue": 355,
            "saturation": 0.78125,
            "lightness": 1.40625,
            "rgb": [
                185,
                74,
                85
            ]
        }
    },
    "120": {
        "name": "Coral",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 22,
            "contrast": 1.19531,
            "hue": 358,
            "saturation": 0.78125,
            "lightness": 1.17188,
            "rgb": [
                169,
                72,
                76
            ]
        },
        "leather": {
            "brightness": 22,
            "contrast": 1.19531,
            "hue": 358,
            "saturation": 0.742188,
            "lightness": 1.17188,
            "rgb": [
                166,
                74,
                77
            ]
        },
        "metal": {
            "brightness": 20,
            "contrast": 1.36719,
            "hue": 358,
            "saturation": 0.859375,
            "lightness": 1.28906,
            "rgb": [
                176,
                54,
                59
            ]
        }
    },
    "698": {
        "name": "Strawberry",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.0625,
            "hue": 356,
            "saturation": 1.09375,
            "lightness": 1.07813,
            "rgb": [
                160,
                37,
                47
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.09375,
            "hue": 356,
            "saturation": 0.9375,
            "lightness": 1.07813,
            "rgb": [
                142,
                33,
                42
            ]
        },
        "metal": {
            "brightness": 14,
            "contrast": 1.36719,
            "hue": 356,
            "saturation": 0.898438,
            "lightness": 1.25,
            "rgb": [
                162,
                32,
                42
            ]
        }
    },
    "673": {
        "name": "Red",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1.0625,
            "hue": 356,
            "saturation": 1.21094,
            "lightness": 0.976563,
            "rgb": [
                135,
                0,
                10
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1.0625,
            "hue": 356,
            "saturation": 0.859375,
            "lightness": 1.09375,
            "rgb": [
                116,
                19,
                27
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.28906,
            "hue": 356,
            "saturation": 1.09375,
            "lightness": 1.09375,
            "rgb": [
                155,
                5,
                17
            ]
        }
    },
    "592": {
        "name": "Cherry",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1.01563,
            "hue": 356,
            "saturation": 1.21094,
            "lightness": 0.921875,
            "rgb": [
                119,
                0,
                0
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1.01563,
            "hue": 356,
            "saturation": 0.898438,
            "lightness": 1.05469,
            "rgb": [
                113,
                16,
                24
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1.13281,
            "hue": 356,
            "saturation": 1.17188,
            "lightness": 1.05469,
            "rgb": [
                133,
                0,
                3
            ]
        }
    },
    "123": {
        "name": "Scarlet",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1,
            "hue": 356,
            "saturation": 0.976563,
            "lightness": 0.898438,
            "rgb": [
                102,
                0,
                6
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 356,
            "saturation": 0.78125,
            "lightness": 0.976563,
            "rgb": [
                95,
                13,
                19
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1.01563,
            "hue": 356,
            "saturation": 1.21094,
            "lightness": 1.09375,
            "rgb": [
                119,
                0,
                0
            ]
        }
    },
    "629": {
        "name": "Lifesblood",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -16,
            "contrast": 1,
            "hue": 356,
            "saturation": 0.976563,
            "lightness": 0.859375,
            "rgb": [
                90,
                0,
                0
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 356,
            "saturation": 0.820313,
            "lightness": 0.898438,
            "rgb": [
                86,
                0,
                6
            ]
        },
        "metal": {
            "brightness": -28,
            "contrast": 1,
            "hue": 356,
            "saturation": 1.36719,
            "lightness": 1.05469,
            "rgb": [
                96,
                0,
                0
            ]
        }
    },
    "122": {
        "name": "Ruby",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 350,
            "saturation": 0.78125,
            "lightness": 0.78125,
            "rgb": [
                71,
                0,
                0
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 350,
            "saturation": 0.703125,
            "lightness": 0.859375,
            "rgb": [
                76,
                0,
                12
            ]
        },
        "metal": {
            "brightness": -33,
            "contrast": 1.09375,
            "hue": 350,
            "saturation": 1.17188,
            "lightness": 1.09375,
            "rgb": [
                72,
                0,
                0
            ]
        }
    },
    "119": {
        "name": "Burgundy",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -23,
            "contrast": 1,
            "hue": 341,
            "saturation": 0.625,
            "lightness": 0.78125,
            "rgb": [
                51,
                0,
                2
            ]
        },
        "leather": {
            "brightness": -23,
            "contrast": 1,
            "hue": 341,
            "saturation": 0.585938,
            "lightness": 0.9375,
            "rgb": [
                50,
                0,
                5
            ]
        },
        "metal": {
            "brightness": -28,
            "contrast": 1,
            "hue": 350,
            "saturation": 0.664063,
            "lightness": 1.09375,
            "rgb": [
                48,
                0,
                0
            ]
        }
    },
    "665": {
        "name": "Peach Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 50,
            "contrast": 1.36719,
            "hue": 18,
            "saturation": 0.429688,
            "lightness": 1.32813,
            "rgb": [
                217,
                171,
                149
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.36719,
            "hue": 18,
            "saturation": 0.390625,
            "lightness": 1.32813,
            "rgb": [
                192,
                150,
                131
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 18,
            "saturation": 0.429688,
            "lightness": 1.48438,
            "rgb": [
                209,
                153,
                128
            ]
        }
    },
    "656": {
        "name": "Pastel Peach",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 45,
            "contrast": 1.17188,
            "hue": 18,
            "saturation": 0.742188,
            "lightness": 1.32813,
            "rgb": [
                239,
                171,
                139
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.17188,
            "hue": 18,
            "saturation": 0.664063,
            "lightness": 1.32813,
            "rgb": [
                212,
                151,
                123
            ]
        },
        "metal": {
            "brightness": 42,
            "contrast": 1.44531,
            "hue": 18,
            "saturation": 0.703125,
            "lightness": 1.48438,
            "rgb": [
                234,
                154,
                117
            ]
        }
    },
    "702": {
        "name": "Sunrise Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 47,
            "contrast": 1.25,
            "hue": 13,
            "saturation": 0.859375,
            "lightness": 1.28906,
            "rgb": [
                247,
                155,
                126
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 13,
            "saturation": 0.625,
            "lightness": 1.28906,
            "rgb": [
                202,
                135,
                114
            ]
        },
        "metal": {
            "brightness": 35,
            "contrast": 1.28906,
            "hue": 13,
            "saturation": 0.78125,
            "lightness": 1.36719,
            "rgb": [
                217,
                130,
                104
            ]
        }
    },
    "1053": {
        "name": "Tulip",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 35,
            "contrast": 1.25,
            "hue": 8,
            "saturation": 0.898438,
            "lightness": 1.32813,
            "rgb": [
                225,
                121,
                103
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 8,
            "saturation": 0.742188,
            "lightness": 1.32813,
            "rgb": [
                204,
                118,
                103
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.32813,
            "hue": 8,
            "saturation": 0.742188,
            "lightness": 1.32813,
            "rgb": [
                201,
                109,
                93
            ]
        }
    },
    "374": {
        "name": "Cantaloupe",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 22,
            "contrast": 1.25,
            "hue": 8,
            "saturation": 0.898438,
            "lightness": 1.40625,
            "rgb": [
                197,
                93,
                75
            ]
        },
        "leather": {
            "brightness": 22,
            "contrast": 1.32813,
            "hue": 8,
            "saturation": 0.742188,
            "lightness": 1.40625,
            "rgb": [
                181,
                89,
                73
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.28906,
            "hue": 8,
            "saturation": 0.742188,
            "lightness": 1.40625,
            "rgb": [
                183,
                94,
                78
            ]
        }
    },
    "633": {
        "name": "Melon",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 18,
            "contrast": 1.25,
            "hue": 8,
            "saturation": 0.859375,
            "lightness": 1.32813,
            "rgb": [
                177,
                77,
                59
            ]
        },
        "leather": {
            "brightness": 18,
            "contrast": 1.28906,
            "hue": 8,
            "saturation": 0.78125,
            "lightness": 1.32813,
            "rgb": [
                169,
                75,
                59
            ]
        },
        "metal": {
            "brightness": 18,
            "contrast": 1.25,
            "hue": 8,
            "saturation": 0.78125,
            "lightness": 1.32813,
            "rgb": [
                170,
                80,
                64
            ]
        }
    },
    "375": {
        "name": "Sherbert",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 14,
            "contrast": 1.25,
            "hue": 8,
            "saturation": 0.820313,
            "lightness": 1.25,
            "rgb": [
                157,
                62,
                45
            ]
        },
        "leather": {
            "brightness": 14,
            "contrast": 1.28906,
            "hue": 8,
            "saturation": 0.703125,
            "lightness": 1.25,
            "rgb": [
                146,
                62,
                47
            ]
        },
        "metal": {
            "brightness": 14,
            "contrast": 1.25,
            "hue": 8,
            "saturation": 0.78125,
            "lightness": 1.25,
            "rgb": [
                154,
                63,
                47
            ]
        }
    },
    "648": {
        "name": "Papaya",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 3,
            "saturation": 0.898438,
            "lightness": 1.09375,
            "rgb": [
                151,
                50,
                44
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.17188,
            "hue": 3,
            "saturation": 0.78125,
            "lightness": 1.09375,
            "rgb": [
                141,
                50,
                45
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.21094,
            "hue": 3,
            "saturation": 0.820313,
            "lightness": 1.13281,
            "rgb": [
                146,
                48,
                42
            ]
        }
    },
    "376": {
        "name": "Salmon",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.17188,
            "hue": 5,
            "saturation": 0.859375,
            "lightness": 1.05469,
            "rgb": [
                133,
                36,
                26
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.17188,
            "hue": 5,
            "saturation": 0.78125,
            "lightness": 1.05469,
            "rgb": [
                127,
                39,
                30
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.25,
            "hue": 5,
            "saturation": 0.703125,
            "lightness": 1.17188,
            "rgb": [
                126,
                41,
                32
            ]
        }
    },
    "593": {
        "name": "Chestnut",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1,
            "hue": 13,
            "saturation": 1.01563,
            "lightness": 1.01563,
            "rgb": [
                107,
                20,
                0
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 13,
            "saturation": 0.898438,
            "lightness": 1.05469,
            "rgb": [
                105,
                28,
                4
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1.09375,
            "hue": 11,
            "saturation": 0.9375,
            "lightness": 1.05469,
            "rgb": [
                114,
                23,
                0
            ]
        }
    },
    "377": {
        "name": "Autumn",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 16,
            "saturation": 0.976563,
            "lightness": 1.01563,
            "rgb": [
                88,
                8,
                0
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 16,
            "saturation": 0.820313,
            "lightness": 1.01563,
            "rgb": [
                88,
                21,
                0
            ]
        },
        "metal": {
            "brightness": -12,
            "contrast": 1.05469,
            "hue": 5,
            "saturation": 0.859375,
            "lightness": 1.05469,
            "rgb": [
                95,
                7,
                0
            ]
        }
    },
    "378": {
        "name": "Brick",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -23,
            "contrast": 1,
            "hue": 16,
            "saturation": 0.898438,
            "lightness": 0.898438,
            "rgb": [
                71,
                0,
                0
            ]
        },
        "leather": {
            "brightness": -22,
            "contrast": 1,
            "hue": 16,
            "saturation": 0.820313,
            "lightness": 0.898438,
            "rgb": [
                67,
                0,
                0
            ]
        },
        "metal": {
            "brightness": -18,
            "contrast": 1.05469,
            "hue": 6,
            "saturation": 0.703125,
            "lightness": 1.01563,
            "rgb": [
                70,
                0,
                0
            ]
        }
    },
    "586": {
        "name": "Black Cherry",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -33,
            "contrast": 1,
            "hue": 15,
            "saturation": 0.859375,
            "lightness": 0.820313,
            "rgb": [
                51,
                0,
                0
            ]
        },
        "leather": {
            "brightness": -25,
            "contrast": 1,
            "hue": 15,
            "saturation": 0.78125,
            "lightness": 0.820313,
            "rgb": [
                59,
                0,
                0
            ]
        },
        "metal": {
            "brightness": -20,
            "contrast": 1.13281,
            "hue": 5,
            "saturation": 0.703125,
            "lightness": 1.01563,
            "rgb": [
                65,
                0,
                0
            ]
        }
    },
    "596": {
        "name": "Citrus Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 50,
            "contrast": 1.36719,
            "hue": 26,
            "saturation": 0.507813,
            "lightness": 1.28906,
            "rgb": [
                216,
                170,
                134
            ]
        },
        "leather": {
            "brightness": 47,
            "contrast": 1.36719,
            "hue": 26,
            "saturation": 0.507813,
            "lightness": 1.28906,
            "rgb": [
                208,
                163,
                127
            ]
        },
        "metal": {
            "brightness": 48,
            "contrast": 1.64063,
            "hue": 26,
            "saturation": 0.507813,
            "lightness": 1.48438,
            "rgb": [
                217,
                162,
                119
            ]
        }
    },
    "650": {
        "name": "Pastel Citrus",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 45,
            "contrast": 1.17188,
            "hue": 26,
            "saturation": 0.820313,
            "lightness": 1.25,
            "rgb": [
                231,
                168,
                118
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.17188,
            "hue": 26,
            "saturation": 0.820313,
            "lightness": 1.25,
            "rgb": [
                224,
                160,
                111
            ]
        },
        "metal": {
            "brightness": 42,
            "contrast": 1.52344,
            "hue": 26,
            "saturation": 0.742188,
            "lightness": 1.48438,
            "rgb": [
                230,
                155,
                97
            ]
        }
    },
    "595": {
        "name": "Citrus Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 42,
            "contrast": 1.25,
            "hue": 20,
            "saturation": 0.9375,
            "lightness": 1.28906,
            "rgb": [
                238,
                149,
                102
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 20,
            "saturation": 0.78125,
            "lightness": 1.28906,
            "rgb": [
                211,
                135,
                94
            ]
        },
        "metal": {
            "brightness": 40,
            "contrast": 1.36719,
            "hue": 20,
            "saturation": 0.898438,
            "lightness": 1.36719,
            "rgb": [
                235,
                142,
                93
            ]
        }
    },
    "594": {
        "name": "Citrus",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 20,
            "saturation": 1.01563,
            "lightness": 1.36719,
            "rgb": [
                227,
                131,
                80
            ]
        },
        "leather": {
            "brightness": 30,
            "contrast": 1.25,
            "hue": 20,
            "saturation": 0.859375,
            "lightness": 1.32813,
            "rgb": [
                205,
                124,
                80
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.32813,
            "hue": 20,
            "saturation": 0.898438,
            "lightness": 1.32813,
            "rgb": [
                211,
                120,
                72
            ]
        }
    },
    "111": {
        "name": "Creamsicle",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 22,
            "contrast": 1.25,
            "hue": 20,
            "saturation": 1,
            "lightness": 1.40625,
            "rgb": [
                202,
                107,
                57
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 20,
            "saturation": 0.898438,
            "lightness": 1.40625,
            "rgb": [
                180,
                95,
                49
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.32813,
            "hue": 20,
            "saturation": 0.898438,
            "lightness": 1.40625,
            "rgb": [
                191,
                100,
                52
            ]
        }
    },
    "647": {
        "name": "Orangespring",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 19,
            "contrast": 1.25,
            "hue": 18,
            "saturation": 1,
            "lightness": 1.28906,
            "rgb": [
                185,
                86,
                41
            ]
        },
        "leather": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 18,
            "saturation": 0.898438,
            "lightness": 1.28906,
            "rgb": [
                166,
                78,
                37
            ]
        },
        "metal": {
            "brightness": 14,
            "contrast": 1.25,
            "hue": 18,
            "saturation": 0.9375,
            "lightness": 1.28906,
            "rgb": [
                167,
                74,
                32
            ]
        }
    },
    "109": {
        "name": "Apricot",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 18,
            "contrast": 1.25,
            "hue": 22,
            "saturation": 0.9375,
            "lightness": 1.09375,
            "rgb": [
                160,
                75,
                23
            ]
        },
        "leather": {
            "brightness": 15,
            "contrast": 1.28906,
            "hue": 22,
            "saturation": 0.820313,
            "lightness": 1.09375,
            "rgb": [
                143,
                66,
                20
            ]
        },
        "metal": {
            "brightness": 18,
            "contrast": 1.32813,
            "hue": 22,
            "saturation": 0.820313,
            "lightness": 1.09375,
            "rgb": [
                149,
                70,
                22
            ]
        }
    },
    "112": {
        "name": "Orange",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 18,
            "saturation": 0.898438,
            "lightness": 1.09375,
            "rgb": [
                152,
                63,
                23
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 18,
            "saturation": 0.859375,
            "lightness": 1.09375,
            "rgb": [
                142,
                58,
                18
            ]
        },
        "metal": {
            "brightness": 15,
            "contrast": 1.32813,
            "hue": 18,
            "saturation": 0.820313,
            "lightness": 1.09375,
            "rgb": [
                144,
                58,
                18
            ]
        }
    },
    "616": {
        "name": "Grapefruit",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 20,
            "saturation": 0.921875,
            "lightness": 1.01563,
            "rgb": [
                137,
                50,
                3
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.25,
            "hue": 20,
            "saturation": 0.820313,
            "lightness": 1.01563,
            "rgb": [
                123,
                45,
                4
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.25,
            "hue": 20,
            "saturation": 0.859375,
            "lightness": 1.01563,
            "rgb": [
                126,
                45,
                1
            ]
        }
    },
    "582": {
        "name": "Adobe Sunset",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1.17188,
            "hue": 30,
            "saturation": 1.21094,
            "lightness": 0.898438,
            "rgb": [
                117,
                34,
                0
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1.17188,
            "hue": 30,
            "saturation": 1.01563,
            "lightness": 0.898438,
            "rgb": [
                104,
                34,
                0
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1.17188,
            "hue": 26,
            "saturation": 1.01563,
            "lightness": 0.976563,
            "rgb": [
                110,
                31,
                0
            ]
        }
    },
    "113": {
        "name": "Sunset",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -12,
            "contrast": 1.19531,
            "hue": 33,
            "saturation": 1.13281,
            "lightness": 0.820313,
            "rgb": [
                95,
                23,
                0
            ]
        },
        "leather": {
            "brightness": -10,
            "contrast": 1.19531,
            "hue": 33,
            "saturation": 0.976563,
            "lightness": 0.898438,
            "rgb": [
                90,
                28,
                0
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1.19531,
            "hue": 26,
            "saturation": 1.01563,
            "lightness": 0.820313,
            "rgb": [
                99,
                19,
                0
            ]
        }
    },
    "608": {
        "name": "Evening Red",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -22,
            "contrast": 1.09375,
            "hue": 33,
            "saturation": 1.17188,
            "lightness": 0.78125,
            "rgb": [
                80,
                12,
                0
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1.09375,
            "hue": 33,
            "saturation": 1.05469,
            "lightness": 0.78125,
            "rgb": [
                79,
                17,
                0
            ]
        },
        "metal": {
            "brightness": -22,
            "contrast": 1.13281,
            "hue": 33,
            "saturation": 1.17188,
            "lightness": 0.78125,
            "rgb": [
                81,
                10,
                0
            ]
        }
    },
    "110": {
        "name": "Cinnamon",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -23,
            "contrast": 1,
            "hue": 32,
            "saturation": 0.859375,
            "lightness": 0.742188,
            "rgb": [
                59,
                12,
                0
            ]
        },
        "leather": {
            "brightness": -23,
            "contrast": 1,
            "hue": 32,
            "saturation": 0.859375,
            "lightness": 0.742188,
            "rgb": [
                59,
                12,
                0
            ]
        },
        "metal": {
            "brightness": -23,
            "contrast": 1,
            "hue": 32,
            "saturation": 0.859375,
            "lightness": 0.898438,
            "rgb": [
                62,
                14,
                0
            ]
        }
    },
    "621": {
        "name": "Honey Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 48,
            "contrast": 1.36719,
            "hue": 33,
            "saturation": 0.546875,
            "lightness": 1.32813,
            "rgb": [
                216,
                176,
                128
            ]
        },
        "leather": {
            "brightness": 45,
            "contrast": 1.40625,
            "hue": 33,
            "saturation": 0.546875,
            "lightness": 1.32813,
            "rgb": [
                206,
                165,
                115
            ]
        },
        "metal": {
            "brightness": 48,
            "contrast": 1.64063,
            "hue": 33,
            "saturation": 0.546875,
            "lightness": 1.48438,
            "rgb": [
                218,
                170,
                112
            ]
        }
    },
    "651": {
        "name": "Pastel Honey",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 45,
            "contrast": 1.25,
            "hue": 33,
            "saturation": 0.742188,
            "lightness": 1.28906,
            "rgb": [
                224,
                174,
                115
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.28906,
            "hue": 33,
            "saturation": 0.664063,
            "lightness": 1.28906,
            "rgb": [
                209,
                163,
                108
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.5625,
            "hue": 33,
            "saturation": 0.742188,
            "lightness": 1.5625,
            "rgb": [
                246,
                184,
                110
            ]
        }
    },
    "591": {
        "name": "Buttercream",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 40,
            "contrast": 1.25,
            "hue": 30,
            "saturation": 0.898438,
            "lightness": 1.28906,
            "rgb": [
                224,
                158,
                92
            ]
        },
        "leather": {
            "brightness": 35,
            "contrast": 1.25,
            "hue": 30,
            "saturation": 0.820313,
            "lightness": 1.28906,
            "rgb": [
                206,
                145,
                85
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.32813,
            "hue": 33,
            "saturation": 0.859375,
            "lightness": 1.36719,
            "rgb": [
                217,
                156,
                83
            ]
        }
    },
    "623": {
        "name": "Honeysuckle",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 34,
            "contrast": 1.25,
            "hue": 30,
            "saturation": 0.898438,
            "lightness": 1.25,
            "rgb": [
                204,
                138,
                72
            ]
        },
        "leather": {
            "brightness": 35,
            "contrast": 1.25,
            "hue": 33,
            "saturation": 0.820313,
            "lightness": 1.28906,
            "rgb": [
                204,
                149,
                83
            ]
        },
        "metal": {
            "brightness": 35,
            "contrast": 1.44531,
            "hue": 33,
            "saturation": 0.859375,
            "lightness": 1.36719,
            "rgb": [
                207,
                140,
                61
            ]
        }
    },
    "379": {
        "name": "Butter",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 24,
            "contrast": 1.25,
            "hue": 33,
            "saturation": 0.9375,
            "lightness": 1.25,
            "rgb": [
                180,
                117,
                42
            ]
        },
        "leather": {
            "brightness": 22,
            "contrast": 1.25,
            "hue": 33,
            "saturation": 0.859375,
            "lightness": 1.25,
            "rgb": [
                170,
                112,
                43
            ]
        },
        "metal": {
            "brightness": 24,
            "contrast": 1.32813,
            "hue": 33,
            "saturation": 0.898438,
            "lightness": 1.44531,
            "rgb": [
                191,
                128,
                51
            ]
        }
    },
    "622": {
        "name": "Honeybutter",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 18,
            "contrast": 1.17188,
            "hue": 30,
            "saturation": 1.01563,
            "lightness": 1.21094,
            "rgb": [
                172,
                102,
                32
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.17188,
            "hue": 30,
            "saturation": 0.898438,
            "lightness": 1.21094,
            "rgb": [
                161,
                99,
                37
            ]
        },
        "metal": {
            "brightness": 20,
            "contrast": 1.28906,
            "hue": 30,
            "saturation": 1.01563,
            "lightness": 1.28906,
            "rgb": [
                180,
                103,
                26
            ]
        }
    },
    "380": {
        "name": "Honey",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.09375,
            "hue": 32,
            "saturation": 1.09375,
            "lightness": 1.13281,
            "rgb": [
                152,
                86,
                11
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.09375,
            "hue": 28,
            "saturation": 1.01563,
            "lightness": 1.13281,
            "rgb": [
                150,
                80,
                19
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.21094,
            "hue": 26,
            "saturation": 1.09375,
            "lightness": 1.17188,
            "rgb": [
                157,
                70,
                2
            ]
        }
    },
    "381": {
        "name": "Tangerine",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 40,
            "saturation": 1.71875,
            "lightness": 1.01563,
            "rgb": [
                134,
                64,
                0
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 38,
            "saturation": 1.48438,
            "lightness": 1.01563,
            "rgb": [
                124,
                58,
                0
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 33,
            "saturation": 1.5625,
            "lightness": 1.13281,
            "rgb": [
                138,
                55,
                0
            ]
        }
    },
    "382": {
        "name": "Amber",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1,
            "hue": 36,
            "saturation": 1.5625,
            "lightness": 0.9375,
            "rgb": [
                123,
                48,
                0
            ]
        },
        "leather": {
            "brightness": -10,
            "contrast": 1,
            "hue": 33,
            "saturation": 1.28906,
            "lightness": 0.976563,
            "rgb": [
                112,
                43,
                0
            ]
        },
        "metal": {
            "brightness": -10,
            "contrast": 1.05469,
            "hue": 32,
            "saturation": 1.40625,
            "lightness": 1.01563,
            "rgb": [
                122,
                40,
                0
            ]
        }
    },
    "686": {
        "name": "Sienna",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -14,
            "contrast": 1,
            "hue": 36,
            "saturation": 1.28906,
            "lightness": 0.9375,
            "rgb": [
                100,
                39,
                0
            ]
        },
        "leather": {
            "brightness": -14,
            "contrast": 1,
            "hue": 36,
            "saturation": 1.21094,
            "lightness": 0.9375,
            "rgb": [
                96,
                38,
                0
            ]
        },
        "metal": {
            "brightness": -14,
            "contrast": 1,
            "hue": 30,
            "saturation": 1.28906,
            "lightness": 0.9375,
            "rgb": [
                105,
                30,
                0
            ]
        }
    },
    "338": {
        "name": "Clove",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 40,
            "saturation": 1.25,
            "lightness": 0.898438,
            "rgb": [
                86,
                36,
                0
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 40,
            "saturation": 1.25,
            "lightness": 0.898438,
            "rgb": [
                86,
                36,
                0
            ]
        },
        "metal": {
            "brightness": -18,
            "contrast": 1,
            "hue": 34,
            "saturation": 1.25,
            "lightness": 0.9375,
            "rgb": [
                92,
                28,
                0
            ]
        }
    },
    "705": {
        "name": "Umber",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -28,
            "contrast": 1,
            "hue": 45,
            "saturation": 1.32813,
            "lightness": 0.859375,
            "rgb": [
                67,
                26,
                0
            ]
        },
        "leather": {
            "brightness": -28,
            "contrast": 1,
            "hue": 45,
            "saturation": 1.32813,
            "lightness": 0.859375,
            "rgb": [
                67,
                26,
                0
            ]
        },
        "metal": {
            "brightness": -23,
            "contrast": 1,
            "hue": 45,
            "saturation": 1.17188,
            "lightness": 0.9375,
            "rgb": [
                69,
                33,
                0
            ]
        }
    },
    "601": {
        "name": "Dark Chocolate",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -33,
            "contrast": 1,
            "hue": 48,
            "saturation": 1.32813,
            "lightness": 0.78125,
            "rgb": [
                55,
                23,
                0
            ]
        },
        "leather": {
            "brightness": -33,
            "contrast": 1,
            "hue": 48,
            "saturation": 1.32813,
            "lightness": 0.78125,
            "rgb": [
                55,
                23,
                0
            ]
        },
        "metal": {
            "brightness": -23,
            "contrast": 1,
            "hue": 48,
            "saturation": 1.32813,
            "lightness": 0.820313,
            "rgb": [
                71,
                39,
                0
            ]
        }
    },
    "628": {
        "name": "Lemon Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 47,
            "contrast": 1.36719,
            "hue": 45,
            "saturation": 0.585938,
            "lightness": 1.28906,
            "rgb": [
                204,
                180,
                113
            ]
        },
        "leather": {
            "brightness": 47,
            "contrast": 1.36719,
            "hue": 45,
            "saturation": 0.585938,
            "lightness": 1.28906,
            "rgb": [
                204,
                180,
                113
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.60156,
            "hue": 40,
            "saturation": 0.585938,
            "lightness": 1.48438,
            "rgb": [
                216,
                178,
                107
            ]
        }
    },
    "652": {
        "name": "Pastel Lemon",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 45,
            "contrast": 1.25,
            "hue": 45,
            "saturation": 0.78125,
            "lightness": 1.28906,
            "rgb": [
                218,
                188,
                107
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.25,
            "hue": 45,
            "saturation": 0.78125,
            "lightness": 1.28906,
            "rgb": [
                210,
                180,
                99
            ]
        },
        "metal": {
            "brightness": 45,
            "contrast": 1.5625,
            "hue": 42,
            "saturation": 0.78125,
            "lightness": 1.48438,
            "rgb": [
                227,
                183,
                86
            ]
        }
    },
    "642": {
        "name": "Nectar",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 40,
            "contrast": 1.25,
            "hue": 45,
            "saturation": 0.898438,
            "lightness": 1.28906,
            "rgb": [
                212,
                178,
                84
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 45,
            "saturation": 0.859375,
            "lightness": 1.28906,
            "rgb": [
                202,
                169,
                80
            ]
        },
        "metal": {
            "brightness": 39,
            "contrast": 1.44531,
            "hue": 42,
            "saturation": 0.859375,
            "lightness": 1.36719,
            "rgb": [
                210,
                164,
                66
            ]
        }
    },
    "585": {
        "name": "Banana",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 35,
            "contrast": 1.25,
            "hue": 45,
            "saturation": 0.976563,
            "lightness": 1.25,
            "rgb": [
                199,
                162,
                61
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 45,
            "saturation": 0.898438,
            "lightness": 1.25,
            "rgb": [
                187,
                153,
                59
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.44531,
            "hue": 40,
            "saturation": 0.898438,
            "lightness": 1.36719,
            "rgb": [
                195,
                143,
                45
            ]
        }
    },
    "148": {
        "name": "Lemonade",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 26,
            "contrast": 1.25,
            "hue": 45,
            "saturation": 0.9375,
            "lightness": 1.21094,
            "rgb": [
                171,
                135,
                38
            ]
        },
        "leather": {
            "brightness": 25,
            "contrast": 1.25,
            "hue": 45,
            "saturation": 0.859375,
            "lightness": 1.21094,
            "rgb": [
                164,
                131,
                42
            ]
        },
        "metal": {
            "brightness": 26,
            "contrast": 1.28906,
            "hue": 40,
            "saturation": 0.9375,
            "lightness": 1.25,
            "rgb": [
                178,
                129,
                38
            ]
        }
    },
    "600": {
        "name": "Daffodil",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 19,
            "contrast": 1.09375,
            "hue": 41,
            "saturation": 1.17188,
            "lightness": 1.13281,
            "rgb": [
                169,
                120,
                21
            ]
        },
        "leather": {
            "brightness": 15,
            "contrast": 1.09375,
            "hue": 41,
            "saturation": 1.09375,
            "lightness": 1.13281,
            "rgb": [
                156,
                110,
                17
            ]
        },
        "metal": {
            "brightness": 19,
            "contrast": 1.25,
            "hue": 37,
            "saturation": 1.09375,
            "lightness": 1.21094,
            "rgb": [
                172,
                109,
                12
            ]
        }
    },
    "147": {
        "name": "Lemon",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.09375,
            "hue": 43,
            "saturation": 1.25,
            "lightness": 1.13281,
            "rgb": [
                155,
                108,
                0
            ]
        },
        "leather": {
            "brightness": 8,
            "contrast": 1.09375,
            "hue": 45,
            "saturation": 1.13281,
            "lightness": 1.13281,
            "rgb": [
                138,
                100,
                0
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 1.25,
            "lightness": 1.17188,
            "rgb": [
                159,
                96,
                0
            ]
        }
    },
    "146": {
        "name": "Harvest Gold",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1,
            "hue": 45,
            "saturation": 1.71875,
            "lightness": 1.01563,
            "rgb": [
                137,
                85,
                0
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1,
            "hue": 45,
            "saturation": 1.5625,
            "lightness": 1.01563,
            "rgb": [
                125,
                78,
                0
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.09375,
            "hue": 40,
            "saturation": 1.5625,
            "lightness": 1.13281,
            "rgb": [
                142,
                74,
                0
            ]
        }
    },
    "144": {
        "name": "Butterscotch",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1.05469,
            "hue": 45,
            "saturation": 1.67969,
            "lightness": 0.9375,
            "rgb": [
                122,
                68,
                0
            ]
        },
        "leather": {
            "brightness": -10,
            "contrast": 1.05469,
            "hue": 45,
            "saturation": 1.5625,
            "lightness": 0.9375,
            "rgb": [
                113,
                63,
                0
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1.09375,
            "hue": 40,
            "saturation": 1.5625,
            "lightness": 0.9375,
            "rgb": [
                124,
                55,
                0
            ]
        }
    },
    "677": {
        "name": "Root",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -11,
            "contrast": 1.05469,
            "hue": 45,
            "saturation": 1.5625,
            "lightness": 0.898438,
            "rgb": [
                110,
                59,
                0
            ]
        },
        "leather": {
            "brightness": -11,
            "contrast": 1.05469,
            "hue": 45,
            "saturation": 1.5625,
            "lightness": 0.898438,
            "rgb": [
                110,
                59,
                0
            ]
        },
        "metal": {
            "brightness": -11,
            "contrast": 1.05469,
            "hue": 45,
            "saturation": 1.5625,
            "lightness": 0.898438,
            "rgb": [
                110,
                59,
                0
            ]
        }
    },
    "145": {
        "name": "Caramel",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 46,
            "saturation": 1.5625,
            "lightness": 0.859375,
            "rgb": [
                94,
                49,
                0
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 46,
            "saturation": 1.5625,
            "lightness": 0.859375,
            "rgb": [
                94,
                49,
                0
            ]
        },
        "metal": {
            "brightness": -18,
            "contrast": 1.05469,
            "hue": 40,
            "saturation": 1.48438,
            "lightness": 0.9375,
            "rgb": [
                100,
                37,
                0
            ]
        }
    },
    "618": {
        "name": "Hazel",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -25,
            "contrast": 1,
            "hue": 49,
            "saturation": 1.5625,
            "lightness": 0.78125,
            "rgb": [
                77,
                42,
                0
            ]
        },
        "leather": {
            "brightness": -25,
            "contrast": 1,
            "hue": 49,
            "saturation": 1.44531,
            "lightness": 0.78125,
            "rgb": [
                72,
                39,
                0
            ]
        },
        "metal": {
            "brightness": -25,
            "contrast": 1.05469,
            "hue": 42,
            "saturation": 1.44531,
            "lightness": 0.9375,
            "rgb": [
                82,
                27,
                0
            ]
        }
    },
    "604": {
        "name": "Deep Maple",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -33,
            "contrast": 1,
            "hue": 49,
            "saturation": 1.5625,
            "lightness": 0.742188,
            "rgb": [
                65,
                30,
                0
            ]
        },
        "leather": {
            "brightness": -33,
            "contrast": 1,
            "hue": 49,
            "saturation": 1.48438,
            "lightness": 0.742188,
            "rgb": [
                61,
                28,
                0
            ]
        },
        "metal": {
            "brightness": -28,
            "contrast": 1.05469,
            "hue": 42,
            "saturation": 1.48438,
            "lightness": 0.859375,
            "rgb": [
                79,
                22,
                0
            ]
        }
    },
    "693": {
        "name": "Spring Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 47,
            "contrast": 1.36719,
            "hue": 55,
            "saturation": 0.585938,
            "lightness": 1.28906,
            "rgb": [
                197,
                189,
                112
            ]
        },
        "leather": {
            "brightness": 45,
            "contrast": 1.36719,
            "hue": 55,
            "saturation": 0.585938,
            "lightness": 1.28906,
            "rgb": [
                192,
                184,
                106
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 55,
            "saturation": 0.46875,
            "lightness": 1.48438,
            "rgb": [
                193,
                186,
                111
            ]
        }
    },
    "661": {
        "name": "Pastel Spring",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 55,
            "saturation": 0.78125,
            "lightness": 1.32813,
            "rgb": [
                193,
                183,
                89
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 55,
            "saturation": 0.78125,
            "lightness": 1.32813,
            "rgb": [
                193,
                183,
                89
            ]
        },
        "metal": {
            "brightness": 40,
            "contrast": 1.44531,
            "hue": 53,
            "saturation": 0.703125,
            "lightness": 1.48438,
            "rgb": [
                204,
                189,
                94
            ]
        }
    },
    "598": {
        "name": "Cornsilk",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 30,
            "contrast": 1.25,
            "hue": 55,
            "saturation": 0.859375,
            "lightness": 1.32813,
            "rgb": [
                178,
                167,
                64
            ]
        },
        "leather": {
            "brightness": 30,
            "contrast": 1.25,
            "hue": 53,
            "saturation": 0.78125,
            "lightness": 1.32813,
            "rgb": [
                176,
                162,
                70
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.28906,
            "hue": 52,
            "saturation": 0.820313,
            "lightness": 1.32813,
            "rgb": [
                182,
                165,
                67
            ]
        }
    },
    "697": {
        "name": "Stem",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 22,
            "contrast": 1.25,
            "hue": 55,
            "saturation": 0.859375,
            "lightness": 1.32813,
            "rgb": [
                157,
                146,
                42
            ]
        },
        "leather": {
            "brightness": 22,
            "contrast": 1.25,
            "hue": 53,
            "saturation": 0.78125,
            "lightness": 1.32813,
            "rgb": [
                155,
                141,
                49
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.28906,
            "hue": 52,
            "saturation": 0.820313,
            "lightness": 1.32813,
            "rgb": [
                164,
                146,
                48
            ]
        }
    },
    "54": {
        "name": "Chartreuse",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 55,
            "saturation": 0.742188,
            "lightness": 1.40625,
            "rgb": [
                138,
                129,
                39
            ]
        },
        "leather": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 53,
            "saturation": 0.742188,
            "lightness": 1.40625,
            "rgb": [
                140,
                127,
                40
            ]
        },
        "metal": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 53,
            "saturation": 0.742188,
            "lightness": 1.40625,
            "rgb": [
                140,
                127,
                40
            ]
        }
    },
    "695": {
        "name": "Spring Moss",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.09375,
            "hue": 58,
            "saturation": 1.09375,
            "lightness": 1.09375,
            "rgb": [
                123,
                118,
                0
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.09375,
            "hue": 58,
            "saturation": 1.01563,
            "lightness": 1.09375,
            "rgb": [
                120,
                115,
                5
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.13281,
            "hue": 58,
            "saturation": 0.9375,
            "lightness": 1.17188,
            "rgb": [
                121,
                117,
                10
            ]
        }
    },
    "687": {
        "name": "Sour",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 2,
            "contrast": 1.09375,
            "hue": 58,
            "saturation": 1.32813,
            "lightness": 1.09375,
            "rgb": [
                115,
                109,
                0
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1.09375,
            "hue": 58,
            "saturation": 1.17188,
            "lightness": 1.09375,
            "rgb": [
                109,
                103,
                0
            ]
        },
        "metal": {
            "brightness": 2,
            "contrast": 1.13281,
            "hue": 58,
            "saturation": 1.17188,
            "lightness": 1.13281,
            "rgb": [
                110,
                104,
                0
            ]
        }
    },
    "52": {
        "name": "Avocado",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1.09375,
            "hue": 58,
            "saturation": 1.32813,
            "lightness": 1.05469,
            "rgb": [
                102,
                96,
                0
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1.09375,
            "hue": 58,
            "saturation": 1.17188,
            "lightness": 1.05469,
            "rgb": [
                96,
                91,
                0
            ]
        },
        "metal": {
            "brightness": 0,
            "contrast": 1.13281,
            "hue": 58,
            "saturation": 1.05469,
            "lightness": 1.09375,
            "rgb": [
                98,
                93,
                0
            ]
        }
    },
    "688": {
        "name": "Sour Apple",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 56,
            "saturation": 1.5625,
            "lightness": 0.9375,
            "rgb": [
                91,
                78,
                0
            ]
        },
        "leather": {
            "brightness": -15,
            "contrast": 1,
            "hue": 56,
            "saturation": 1.44531,
            "lightness": 0.9375,
            "rgb": [
                83,
                71,
                0
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 56,
            "saturation": 1.40625,
            "lightness": 1.01563,
            "rgb": [
                88,
                76,
                0
            ]
        }
    },
    "340": {
        "name": "Khaki",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 56,
            "saturation": 1.5625,
            "lightness": 0.9375,
            "rgb": [
                81,
                69,
                0
            ]
        },
        "leather": {
            "brightness": -15,
            "contrast": 1,
            "hue": 56,
            "saturation": 1.44531,
            "lightness": 0.9375,
            "rgb": [
                83,
                71,
                0
            ]
        },
        "metal": {
            "brightness": -15,
            "contrast": 1.05469,
            "hue": 56,
            "saturation": 1.36719,
            "lightness": 0.9375,
            "rgb": [
                79,
                67,
                0
            ]
        }
    },
    "341": {
        "name": "Patina",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -25,
            "contrast": 1,
            "hue": 53,
            "saturation": 1.48438,
            "lightness": 0.859375,
            "rgb": [
                69,
                48,
                0
            ]
        },
        "leather": {
            "brightness": -23,
            "contrast": 1,
            "hue": 53,
            "saturation": 1.36719,
            "lightness": 0.859375,
            "rgb": [
                67,
                48,
                0
            ]
        },
        "metal": {
            "brightness": -23,
            "contrast": 1,
            "hue": 53,
            "saturation": 1.36719,
            "lightness": 0.9375,
            "rgb": [
                69,
                49,
                0
            ]
        }
    },
    "605": {
        "name": "Deep Pine",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -28,
            "contrast": 1,
            "hue": 54,
            "saturation": 1.32813,
            "lightness": 0.859375,
            "rgb": [
                56,
                40,
                0
            ]
        },
        "leather": {
            "brightness": -28,
            "contrast": 1,
            "hue": 54,
            "saturation": 1.32813,
            "lightness": 0.859375,
            "rgb": [
                56,
                40,
                0
            ]
        },
        "metal": {
            "brightness": -28,
            "contrast": 1,
            "hue": 54,
            "saturation": 1.17188,
            "lightness": 0.859375,
            "rgb": [
                50,
                35,
                0
            ]
        }
    },
    "342": {
        "name": "Tarnish",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -33,
            "contrast": 1,
            "hue": 54,
            "saturation": 1.25,
            "lightness": 0.859375,
            "rgb": [
                44,
                29,
                0
            ]
        },
        "leather": {
            "brightness": -33,
            "contrast": 1,
            "hue": 54,
            "saturation": 1.25,
            "lightness": 0.859375,
            "rgb": [
                44,
                29,
                0
            ]
        },
        "metal": {
            "brightness": -33,
            "contrast": 1,
            "hue": 54,
            "saturation": 1.09375,
            "lightness": 0.859375,
            "rgb": [
                38,
                25,
                0
            ]
        }
    },
    "646": {
        "name": "Olive Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 47,
            "contrast": 1.36719,
            "hue": 65,
            "saturation": 0.507813,
            "lightness": 1.25,
            "rgb": [
                181,
                188,
                114
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.36719,
            "hue": 65,
            "saturation": 0.507813,
            "lightness": 1.32813,
            "rgb": [
                178,
                185,
                111
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 63,
            "saturation": 0.390625,
            "lightness": 1.48438,
            "rgb": [
                183,
                187,
                120
            ]
        }
    },
    "655": {
        "name": "Pastel Olive",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 40,
            "contrast": 1.25,
            "hue": 65,
            "saturation": 0.703125,
            "lightness": 1.25,
            "rgb": [
                179,
                188,
                94
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 65,
            "saturation": 0.703125,
            "lightness": 1.25,
            "rgb": [
                171,
                180,
                86
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.44531,
            "hue": 63,
            "saturation": 0.585938,
            "lightness": 1.52344,
            "rgb": [
                184,
                189,
                100
            ]
        }
    },
    "690": {
        "name": "Spring Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 67,
            "saturation": 0.78125,
            "lightness": 1.17188,
            "rgb": [
                151,
                165,
                59
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 67,
            "saturation": 0.664063,
            "lightness": 1.17188,
            "rgb": [
                147,
                159,
                69
            ]
        },
        "metal": {
            "brightness": 27,
            "contrast": 1.28906,
            "hue": 65,
            "saturation": 0.585938,
            "lightness": 1.28906,
            "rgb": [
                143,
                151,
                70
            ]
        }
    },
    "715": {
        "name": "Zest",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 25,
            "contrast": 1.25,
            "hue": 65,
            "saturation": 0.78125,
            "lightness": 1.17188,
            "rgb": [
                137,
                147,
                42
            ]
        },
        "leather": {
            "brightness": 22,
            "contrast": 1.25,
            "hue": 65,
            "saturation": 0.703125,
            "lightness": 1.17188,
            "rgb": [
                127,
                136,
                42
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.25,
            "hue": 63,
            "saturation": 0.664063,
            "lightness": 1.17188,
            "rgb": [
                134,
                139,
                52
            ]
        }
    },
    "108": {
        "name": "Olive Yew",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 18,
            "contrast": 1.25,
            "hue": 66,
            "saturation": 0.703125,
            "lightness": 1.17188,
            "rgb": [
                116,
                127,
                33
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 66,
            "saturation": 0.703125,
            "lightness": 1.17188,
            "rgb": [
                114,
                125,
                30
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.28906,
            "hue": 63,
            "saturation": 0.664063,
            "lightness": 1.25,
            "rgb": [
                119,
                124,
                34
            ]
        }
    },
    "612": {
        "name": "Fresh Green",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 4,
            "contrast": 1.09375,
            "hue": 65,
            "saturation": 1.25,
            "lightness": 1.05469,
            "rgb": [
                104,
                118,
                0
            ]
        },
        "leather": {
            "brightness": 4,
            "contrast": 1.09375,
            "hue": 65,
            "saturation": 1.05469,
            "lightness": 1.05469,
            "rgb": [
                98,
                109,
                0
            ]
        },
        "metal": {
            "brightness": 4,
            "contrast": 1.09375,
            "hue": 63,
            "saturation": 0.859375,
            "lightness": 1.13281,
            "rgb": [
                98,
                104,
                5
            ]
        }
    },
    "106": {
        "name": "Olive Oil",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1.09375,
            "hue": 65,
            "saturation": 1.32813,
            "lightness": 1.05469,
            "rgb": [
                91,
                106,
                0
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1.09375,
            "hue": 65,
            "saturation": 1.17188,
            "lightness": 1.05469,
            "rgb": [
                87,
                100,
                0
            ]
        },
        "metal": {
            "brightness": 2,
            "contrast": 1.09375,
            "hue": 63,
            "saturation": 0.9375,
            "lightness": 1.09375,
            "rgb": [
                94,
                101,
                0
            ]
        }
    },
    "692": {
        "name": "Spring Grass",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1.09375,
            "hue": 68,
            "saturation": 1.32813,
            "lightness": 0.976563,
            "rgb": [
                73,
                97,
                0
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1.09375,
            "hue": 68,
            "saturation": 1.13281,
            "lightness": 1.09375,
            "rgb": [
                72,
                93,
                0
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1.09375,
            "hue": 68,
            "saturation": 0.976563,
            "lightness": 1.09375,
            "rgb": [
                68,
                85,
                0
            ]
        }
    },
    "105": {
        "name": "Grape Leaf",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 64,
            "saturation": 1.5625,
            "lightness": 0.9375,
            "rgb": [
                69,
                81,
                0
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 64,
            "saturation": 1.40625,
            "lightness": 0.9375,
            "rgb": [
                64,
                75,
                0
            ]
        },
        "metal": {
            "brightness": -18,
            "contrast": 1.05469,
            "hue": 62,
            "saturation": 1.17188,
            "lightness": 0.9375,
            "rgb": [
                58,
                63,
                0
            ]
        }
    },
    "1054": {
        "name": "Grass",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -23,
            "contrast": 1,
            "hue": 61,
            "saturation": 1.5625,
            "lightness": 0.78125,
            "rgb": [
                62,
                65,
                0
            ]
        },
        "leather": {
            "brightness": -23,
            "contrast": 1,
            "hue": 61,
            "saturation": 1.44531,
            "lightness": 0.898438,
            "rgb": [
                60,
                63,
                0
            ]
        },
        "metal": {
            "brightness": -23,
            "contrast": 1.05469,
            "hue": 59,
            "saturation": 1.17188,
            "lightness": 0.898438,
            "rgb": [
                52,
                49,
                0
            ]
        }
    },
    "104": {
        "name": "Olive",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -25,
            "contrast": 1,
            "hue": 59,
            "saturation": 1.48438,
            "lightness": 0.859375,
            "rgb": [
                60,
                57,
                0
            ]
        },
        "leather": {
            "brightness": -23,
            "contrast": 1,
            "hue": 59,
            "saturation": 1.36719,
            "lightness": 0.859375,
            "rgb": [
                59,
                57,
                0
            ]
        },
        "metal": {
            "brightness": -25,
            "contrast": 1,
            "hue": 57,
            "saturation": 1.28906,
            "lightness": 0.859375,
            "rgb": [
                56,
                48,
                0
            ]
        }
    },
    "602": {
        "name": "Dark Olive",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -26,
            "contrast": 1,
            "hue": 59,
            "saturation": 1.25,
            "lightness": 0.78125,
            "rgb": [
                50,
                47,
                0
            ]
        },
        "leather": {
            "brightness": -26,
            "contrast": 1,
            "hue": 59,
            "saturation": 1.25,
            "lightness": 0.78125,
            "rgb": [
                50,
                47,
                0
            ]
        },
        "metal": {
            "brightness": -26,
            "contrast": 1,
            "hue": 59,
            "saturation": 1.05469,
            "lightness": 0.859375,
            "rgb": [
                43,
                41,
                0
            ]
        }
    },
    "107": {
        "name": "Pine",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -33,
            "contrast": 1,
            "hue": 59,
            "saturation": 1.25,
            "lightness": 0.742188,
            "rgb": [
                39,
                36,
                0
            ]
        },
        "leather": {
            "brightness": -28,
            "contrast": 1,
            "hue": 59,
            "saturation": 1.17188,
            "lightness": 0.78125,
            "rgb": [
                44,
                41,
                0
            ]
        },
        "metal": {
            "brightness": -28,
            "contrast": 1,
            "hue": 59,
            "saturation": 1.01563,
            "lightness": 0.78125,
            "rgb": [
                38,
                36,
                0
            ]
        }
    },
    "637": {
        "name": "Mint Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 47,
            "contrast": 1.36719,
            "hue": 85,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                169,
                193,
                136
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.36719,
            "hue": 85,
            "saturation": 0.351563,
            "lightness": 1.40625,
            "rgb": [
                156,
                180,
                123
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 85,
            "saturation": 0.273438,
            "lightness": 1.48438,
            "rgb": [
                166,
                188,
                136
            ]
        }
    },
    "654": {
        "name": "Pastel Mint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 40,
            "contrast": 1.28906,
            "hue": 85,
            "saturation": 0.46875,
            "lightness": 1.28906,
            "rgb": [
                158,
                188,
                117
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 85,
            "saturation": 0.46875,
            "lightness": 1.28906,
            "rgb": [
                150,
                181,
                110
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.44531,
            "hue": 85,
            "saturation": 0.429688,
            "lightness": 1.48438,
            "rgb": [
                157,
                188,
                115
            ]
        }
    },
    "636": {
        "name": "Mint Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.28906,
            "hue": 85,
            "saturation": 0.546875,
            "lightness": 1.25,
            "rgb": [
                134,
                169,
                86
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.28906,
            "hue": 85,
            "saturation": 0.507813,
            "lightness": 1.25,
            "rgb": [
                134,
                166,
                90
            ]
        },
        "metal": {
            "brightness": 27,
            "contrast": 1.28906,
            "hue": 85,
            "saturation": 0.46875,
            "lightness": 1.36719,
            "rgb": [
                132,
                162,
                91
            ]
        }
    },
    "635": {
        "name": "Mint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 27,
            "contrast": 1.28906,
            "hue": 86,
            "saturation": 0.507813,
            "lightness": 1.21094,
            "rgb": [
                117,
                151,
                74
            ]
        },
        "leather": {
            "brightness": 27,
            "contrast": 1.28906,
            "hue": 86,
            "saturation": 0.46875,
            "lightness": 1.21094,
            "rgb": [
                117,
                148,
                77
            ]
        },
        "metal": {
            "brightness": 27,
            "contrast": 1.28906,
            "hue": 86,
            "saturation": 0.429688,
            "lightness": 1.21094,
            "rgb": [
                116,
                145,
                80
            ]
        }
    },
    "133": {
        "name": "Sprout",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 22,
            "contrast": 1.28906,
            "hue": 90,
            "saturation": 0.507813,
            "lightness": 1.17188,
            "rgb": [
                98,
                137,
                60
            ]
        },
        "leather": {
            "brightness": 22,
            "contrast": 1.28906,
            "hue": 90,
            "saturation": 0.507813,
            "lightness": 1.17188,
            "rgb": [
                98,
                137,
                60
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.28906,
            "hue": 90,
            "saturation": 0.429688,
            "lightness": 1.17188,
            "rgb": [
                98,
                131,
                66
            ]
        }
    },
    "694": {
        "name": "Spring Leaf",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 95,
            "saturation": 0.585938,
            "lightness": 1.05469,
            "rgb": [
                75,
                119,
                42
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 95,
            "saturation": 0.507813,
            "lightness": 1.05469,
            "rgb": [
                75,
                114,
                47
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 95,
            "saturation": 0.46875,
            "lightness": 1.05469,
            "rgb": [
                75,
                111,
                49
            ]
        }
    },
    "339": {
        "name": "Wasabi",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 8,
            "contrast": 1.13281,
            "hue": 95,
            "saturation": 0.5625,
            "lightness": 1.05469,
            "rgb": [
                66,
                109,
                35
            ]
        },
        "leather": {
            "brightness": 8,
            "contrast": 1.13281,
            "hue": 95,
            "saturation": 0.507813,
            "lightness": 1.05469,
            "rgb": [
                67,
                106,
                38
            ]
        },
        "metal": {
            "brightness": 8,
            "contrast": 1.13281,
            "hue": 95,
            "saturation": 0.429688,
            "lightness": 1.05469,
            "rgb": [
                67,
                100,
                43
            ]
        }
    },
    "632": {
        "name": "Limette",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1,
            "hue": 95,
            "saturation": 0.742188,
            "lightness": 0.9375,
            "rgb": [
                42,
                92,
                5
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1,
            "hue": 95,
            "saturation": 0.585938,
            "lightness": 0.9375,
            "rgb": [
                43,
                82,
                14
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1,
            "hue": 95,
            "saturation": 0.507813,
            "lightness": 1.01563,
            "rgb": [
                51,
                86,
                26
            ]
        }
    },
    "132": {
        "name": "Lime",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 85,
            "saturation": 0.898438,
            "lightness": 0.898438,
            "rgb": [
                35,
                80,
                0
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 85,
            "saturation": 0.664063,
            "lightness": 0.9375,
            "rgb": [
                35,
                68,
                0
            ]
        },
        "metal": {
            "brightness": -12,
            "contrast": 1,
            "hue": 85,
            "saturation": 0.585938,
            "lightness": 0.976563,
            "rgb": [
                38,
                67,
                0
            ]
        }
    },
    "599": {
        "name": "Cucumber",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -15,
            "contrast": 1,
            "hue": 90,
            "saturation": 0.703125,
            "lightness": 0.898438,
            "rgb": [
                26,
                68,
                0
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 90,
            "saturation": 0.585938,
            "lightness": 0.976563,
            "rgb": [
                33,
                67,
                0
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 90,
            "saturation": 0.507813,
            "lightness": 0.976563,
            "rgb": [
                33,
                63,
                3
            ]
        }
    },
    "131": {
        "name": "Jalapeno",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 85,
            "saturation": 0.703125,
            "lightness": 0.78125,
            "rgb": [
                22,
                57,
                0
            ]
        },
        "leather": {
            "brightness": -15,
            "contrast": 1,
            "hue": 85,
            "saturation": 0.585938,
            "lightness": 0.9375,
            "rgb": [
                31,
                60,
                0
            ]
        },
        "metal": {
            "brightness": -15,
            "contrast": 1,
            "hue": 85,
            "saturation": 0.507813,
            "lightness": 0.9375,
            "rgb": [
                31,
                56,
                0
            ]
        }
    },
    "607": {
        "name": "Evening Grass",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -26,
            "contrast": 1,
            "hue": 80,
            "saturation": 0.859375,
            "lightness": 0.78125,
            "rgb": [
                16,
                51,
                0
            ]
        },
        "leather": {
            "brightness": -23,
            "contrast": 1,
            "hue": 80,
            "saturation": 0.703125,
            "lightness": 0.9375,
            "rgb": [
                21,
                49,
                0
            ]
        },
        "metal": {
            "brightness": -24,
            "contrast": 1,
            "hue": 80,
            "saturation": 0.585938,
            "lightness": 0.9375,
            "rgb": [
                18,
                41,
                0
            ]
        }
    },
    "130": {
        "name": "Evergreen",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -28,
            "contrast": 1,
            "hue": 68,
            "saturation": 0.859375,
            "lightness": 0.78125,
            "rgb": [
                25,
                39,
                0
            ]
        },
        "leather": {
            "brightness": -23,
            "contrast": 1,
            "hue": 80,
            "saturation": 0.703125,
            "lightness": 0.9375,
            "rgb": [
                21,
                49,
                0
            ]
        },
        "metal": {
            "brightness": -24,
            "contrast": 1,
            "hue": 80,
            "saturation": 0.585938,
            "lightness": 0.9375,
            "rgb": [
                18,
                41,
                0
            ]
        }
    },
    "631": {
        "name": "Lime Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 45,
            "contrast": 1.36719,
            "hue": 125,
            "saturation": 0.273438,
            "lightness": 1.36719,
            "rgb": [
                156,
                196,
                160
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.36719,
            "hue": 125,
            "saturation": 0.273438,
            "lightness": 1.44531,
            "rgb": [
                143,
                182,
                146
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 125,
            "saturation": 0.195313,
            "lightness": 1.48438,
            "rgb": [
                151,
                185,
                154
            ]
        }
    },
    "653": {
        "name": "Pastel Lime",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 130,
            "saturation": 0.390625,
            "lightness": 1.36719,
            "rgb": [
                138,
                192,
                148
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 130,
            "saturation": 0.351563,
            "lightness": 1.36719,
            "rgb": [
                140,
                189,
                149
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.44531,
            "hue": 130,
            "saturation": 0.351563,
            "lightness": 1.52344,
            "rgb": [
                135,
                192,
                146
            ]
        }
    },
    "613": {
        "name": "Freshen",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 130,
            "saturation": 0.390625,
            "lightness": 1.25,
            "rgb": [
                124,
                178,
                134
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 130,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                127,
                177,
                136
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 130,
            "saturation": 0.3125,
            "lightness": 1.28906,
            "rgb": [
                129,
                174,
                138
            ]
        }
    },
    "630": {
        "name": "Lime Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 130,
            "saturation": 0.46875,
            "lightness": 1.17188,
            "rgb": [
                99,
                164,
                111
            ]
        },
        "leather": {
            "brightness": 30,
            "contrast": 1.28906,
            "hue": 130,
            "saturation": 0.390625,
            "lightness": 1.25,
            "rgb": [
                103,
                159,
                113
            ]
        },
        "metal": {
            "brightness": 30,
            "contrast": 1.28906,
            "hue": 160,
            "saturation": 0.390625,
            "lightness": 1.25,
            "rgb": [
                93,
                151,
                131
            ]
        }
    },
    "638": {
        "name": "Mintay",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 25,
            "contrast": 1.25,
            "hue": 140,
            "saturation": 0.546875,
            "lightness": 1.17188,
            "rgb": [
                73,
                152,
                100
            ]
        },
        "leather": {
            "brightness": 25,
            "contrast": 1.25,
            "hue": 140,
            "saturation": 0.46875,
            "lightness": 1.17188,
            "rgb": [
                78,
                146,
                102
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.28906,
            "hue": 140,
            "saturation": 0.429688,
            "lightness": 1.28906,
            "rgb": [
                79,
                144,
                102
            ]
        }
    },
    "58": {
        "name": "Key Lime",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 20,
            "contrast": 1.25,
            "hue": 140,
            "saturation": 0.46875,
            "lightness": 1.17188,
            "rgb": [
                66,
                134,
                90
            ]
        },
        "leather": {
            "brightness": 20,
            "contrast": 1.25,
            "hue": 140,
            "saturation": 0.390625,
            "lightness": 1.17188,
            "rgb": [
                71,
                128,
                91
            ]
        },
        "metal": {
            "brightness": 20,
            "contrast": 1.25,
            "hue": 140,
            "saturation": 0.390625,
            "lightness": 1.17188,
            "rgb": [
                71,
                128,
                91
            ]
        }
    },
    "689": {
        "name": "Sprig",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.09375,
            "hue": 145,
            "saturation": 0.585938,
            "lightness": 1.05469,
            "rgb": [
                41,
                117,
                73
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.09375,
            "hue": 145,
            "saturation": 0.507813,
            "lightness": 1.05469,
            "rgb": [
                46,
                111,
                74
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.13281,
            "hue": 145,
            "saturation": 0.429688,
            "lightness": 1.05469,
            "rgb": [
                47,
                104,
                71
            ]
        }
    },
    "55": {
        "name": "Crisp Mint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 2,
            "contrast": 1.05469,
            "hue": 145,
            "saturation": 0.585938,
            "lightness": 1.05469,
            "rgb": [
                29,
                101,
                59
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1.05469,
            "hue": 145,
            "saturation": 0.46875,
            "lightness": 1.05469,
            "rgb": [
                36,
                94,
                60
            ]
        },
        "metal": {
            "brightness": 2,
            "contrast": 1.05469,
            "hue": 145,
            "saturation": 0.429688,
            "lightness": 1.05469,
            "rgb": [
                38,
                91,
                60
            ]
        }
    },
    "617": {
        "name": "Green",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -2,
            "contrast": 1,
            "hue": 135,
            "saturation": 0.546875,
            "lightness": 0.976563,
            "rgb": [
                28,
                90,
                45
            ]
        },
        "leather": {
            "brightness": -2,
            "contrast": 1,
            "hue": 135,
            "saturation": 0.46875,
            "lightness": 0.976563,
            "rgb": [
                32,
                85,
                46
            ]
        },
        "metal": {
            "brightness": -2,
            "contrast": 1,
            "hue": 135,
            "saturation": 0.390625,
            "lightness": 0.976563,
            "rgb": [
                35,
                80,
                47
            ]
        }
    },
    "59": {
        "name": "Leprechaun",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 145,
            "saturation": 0.585938,
            "lightness": 0.976563,
            "rgb": [
                10,
                79,
                39
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 145,
            "saturation": 0.46875,
            "lightness": 0.976563,
            "rgb": [
                16,
                71,
                40
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 145,
            "saturation": 0.429688,
            "lightness": 0.976563,
            "rgb": [
                19,
                69,
                40
            ]
        }
    },
    "709": {
        "name": "Viridian",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1,
            "hue": 150,
            "saturation": 0.507813,
            "lightness": 0.921875,
            "rgb": [
                6,
                66,
                36
            ]
        },
        "leather": {
            "brightness": -10,
            "contrast": 1,
            "hue": 150,
            "saturation": 0.507813,
            "lightness": 0.921875,
            "rgb": [
                6,
                66,
                36
            ]
        },
        "metal": {
            "brightness": -10,
            "contrast": 1,
            "hue": 150,
            "saturation": 0.46875,
            "lightness": 0.921875,
            "rgb": [
                9,
                64,
                36
            ]
        }
    },
    "61": {
        "name": "Summer Grass",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 145,
            "saturation": 0.390625,
            "lightness": 0.859375,
            "rgb": [
                7,
                53,
                26
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 145,
            "saturation": 0.351563,
            "lightness": 0.859375,
            "rgb": [
                9,
                50,
                27
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 145,
            "saturation": 0.351563,
            "lightness": 0.859375,
            "rgb": [
                9,
                50,
                27
            ]
        }
    },
    "56": {
        "name": "Emerald",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -23,
            "contrast": 1,
            "hue": 155,
            "saturation": 0.46875,
            "lightness": 0.859375,
            "rgb": [
                0,
                38,
                14
            ]
        },
        "leather": {
            "brightness": -23,
            "contrast": 1,
            "hue": 155,
            "saturation": 0.46875,
            "lightness": 0.859375,
            "rgb": [
                0,
                38,
                14
            ]
        },
        "metal": {
            "brightness": -20,
            "contrast": 1,
            "hue": 155,
            "saturation": 0.390625,
            "lightness": 0.859375,
            "rgb": [
                0,
                38,
                19
            ]
        }
    },
    "683": {
        "name": "Sea Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 47,
            "contrast": 1.36719,
            "hue": 165,
            "saturation": 0.234375,
            "lightness": 1.32813,
            "rgb": [
                150,
                186,
                177
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.40625,
            "hue": 165,
            "saturation": 0.234375,
            "lightness": 1.36719,
            "rgb": [
                137,
                174,
                164
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 165,
            "saturation": 0.195313,
            "lightness": 1.48438,
            "rgb": [
                142,
                179,
                169
            ]
        }
    },
    "660": {
        "name": "Pastel Sea",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 42,
            "contrast": 1.25,
            "hue": 165,
            "saturation": 0.390625,
            "lightness": 1.28906,
            "rgb": [
                131,
                187,
                172
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 165,
            "saturation": 0.3125,
            "lightness": 1.36719,
            "rgb": [
                129,
                175,
                163
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.44531,
            "hue": 165,
            "saturation": 0.3125,
            "lightness": 1.48438,
            "rgb": [
                124,
                175,
                161
            ]
        }
    },
    "681": {
        "name": "Sea Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 168,
            "saturation": 0.46875,
            "lightness": 1.25,
            "rgb": [
                107,
                172,
                158
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 168,
            "saturation": 0.429688,
            "lightness": 1.25,
            "rgb": [
                110,
                170,
                157
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 168,
            "saturation": 0.351563,
            "lightness": 1.25,
            "rgb": [
                117,
                166,
                155
            ]
        }
    },
    "682": {
        "name": "Sea Frost",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 168,
            "saturation": 0.625,
            "lightness": 1.28906,
            "rgb": [
                85,
                173,
                154
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 168,
            "saturation": 0.507813,
            "lightness": 1.28906,
            "rgb": [
                95,
                166,
                151
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 168,
            "saturation": 0.507813,
            "lightness": 1.28906,
            "rgb": [
                95,
                166,
                151
            ]
        }
    },
    "639": {
        "name": "Morning Sea",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 25,
            "contrast": 1.25,
            "hue": 173,
            "saturation": 0.625,
            "lightness": 1.28906,
            "rgb": [
                67,
                151,
                140
            ]
        },
        "leather": {
            "brightness": 25,
            "contrast": 1.25,
            "hue": 173,
            "saturation": 0.546875,
            "lightness": 1.28906,
            "rgb": [
                73,
                147,
                138
            ]
        },
        "metal": {
            "brightness": 27,
            "contrast": 1.28906,
            "hue": 173,
            "saturation": 0.46875,
            "lightness": 1.28906,
            "rgb": [
                80,
                146,
                137
            ]
        }
    },
    "134": {
        "name": "Seafoam",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 19,
            "contrast": 1.25,
            "hue": 173,
            "saturation": 0.703125,
            "lightness": 1.28906,
            "rgb": [
                45,
                140,
                127
            ]
        },
        "leather": {
            "brightness": 19,
            "contrast": 1.25,
            "hue": 173,
            "saturation": 0.585938,
            "lightness": 1.28906,
            "rgb": [
                54,
                134,
                123
            ]
        },
        "metal": {
            "brightness": 19,
            "contrast": 1.25,
            "hue": 173,
            "saturation": 0.507813,
            "lightness": 1.28906,
            "rgb": [
                61,
                130,
                121
            ]
        }
    },
    "696": {
        "name": "Spring Tide",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 176,
            "saturation": 1.05469,
            "lightness": 1.09375,
            "rgb": [
                1,
                119,
                110
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 176,
            "saturation": 0.703125,
            "lightness": 1.09375,
            "rgb": [
                26,
                105,
                98
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 176,
            "saturation": 0.664063,
            "lightness": 1.09375,
            "rgb": [
                29,
                103,
                97
            ]
        }
    },
    "137": {
        "name": "Turquoise",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 0,
            "contrast": 1.05469,
            "hue": 180,
            "saturation": 1.36719,
            "lightness": 1.05469,
            "rgb": [
                0,
                108,
                108
            ]
        },
        "leather": {
            "brightness": 0,
            "contrast": 1.05469,
            "hue": 180,
            "saturation": 1.05469,
            "lightness": 1.05469,
            "rgb": [
                0,
                97,
                97
            ]
        },
        "metal": {
            "brightness": 0,
            "contrast": 1.05469,
            "hue": 180,
            "saturation": 0.664063,
            "lightness": 1.13281,
            "rgb": [
                16,
                87,
                87
            ]
        }
    },
    "704": {
        "name": "Teal",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1.05469,
            "hue": 180,
            "saturation": 1.25,
            "lightness": 1.05469,
            "rgb": [
                0,
                93,
                93
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 180,
            "saturation": 0.78125,
            "lightness": 1.05469,
            "rgb": [
                0,
                81,
                81
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 180,
            "saturation": 0.664063,
            "lightness": 1.05469,
            "rgb": [
                5,
                76,
                76
            ]
        }
    },
    "135": {
        "name": "Sea Green",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1,
            "hue": 178,
            "saturation": 1.13281,
            "lightness": 1.01563,
            "rgb": [
                0,
                81,
                76
            ]
        },
        "leather": {
            "brightness": -10,
            "contrast": 1,
            "hue": 178,
            "saturation": 0.9375,
            "lightness": 1.01563,
            "rgb": [
                0,
                74,
                70
            ]
        },
        "metal": {
            "brightness": -10,
            "contrast": 1,
            "hue": 178,
            "saturation": 0.898438,
            "lightness": 1.05469,
            "rgb": [
                0,
                74,
                70
            ]
        }
    },
    "606": {
        "name": "Deep Teal",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1,
            "hue": 175,
            "saturation": 0.703125,
            "lightness": 0.78125,
            "rgb": [
                0,
                69,
                62
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 175,
            "saturation": 0.585938,
            "lightness": 0.78125,
            "rgb": [
                2,
                65,
                59
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 175,
            "saturation": 0.585938,
            "lightness": 0.976563,
            "rgb": [
                3,
                65,
                59
            ]
        }
    },
    "136": {
        "name": "Spruce",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 175,
            "saturation": 0.703125,
            "lightness": 0.664063,
            "rgb": [
                0,
                56,
                49
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 175,
            "saturation": 0.585938,
            "lightness": 0.78125,
            "rgb": [
                0,
                57,
                51
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 175,
            "saturation": 0.585938,
            "lightness": 0.78125,
            "rgb": [
                0,
                57,
                51
            ]
        }
    },
    "138": {
        "name": "Wintergreen",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -23,
            "contrast": 1,
            "hue": 180,
            "saturation": 0.703125,
            "lightness": 0.859375,
            "rgb": [
                0,
                35,
                35
            ]
        },
        "leather": {
            "brightness": -23,
            "contrast": 1,
            "hue": 180,
            "saturation": 0.585938,
            "lightness": 0.898438,
            "rgb": [
                0,
                32,
                32
            ]
        },
        "metal": {
            "brightness": -23,
            "contrast": 1,
            "hue": 180,
            "saturation": 0.585938,
            "lightness": 0.859375,
            "rgb": [
                0,
                31,
                31
            ]
        }
    },
    "714": {
        "name": "Winter Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 47,
            "contrast": 1.36719,
            "hue": 193,
            "saturation": 0.234375,
            "lightness": 1.32813,
            "rgb": [
                150,
                177,
                186
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.44531,
            "hue": 193,
            "saturation": 0.234375,
            "lightness": 1.36719,
            "rgb": [
                133,
                162,
                171
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 193,
            "saturation": 0.195313,
            "lightness": 1.48438,
            "rgb": [
                142,
                170,
                178
            ]
        }
    },
    "664": {
        "name": "Pastel Winter",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 42,
            "contrast": 1.25,
            "hue": 193,
            "saturation": 0.429688,
            "lightness": 1.32813,
            "rgb": [
                133,
                179,
                193
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 193,
            "saturation": 0.429688,
            "lightness": 1.36719,
            "rgb": [
                119,
                167,
                182
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.44531,
            "hue": 193,
            "saturation": 0.351563,
            "lightness": 1.48438,
            "rgb": [
                120,
                164,
                177
            ]
        }
    },
    "712": {
        "name": "Winter Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 193,
            "saturation": 0.46875,
            "lightness": 1.28906,
            "rgb": [
                111,
                162,
                177
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.28906,
            "hue": 193,
            "saturation": 0.390625,
            "lightness": 1.36719,
            "rgb": [
                109,
                152,
                166
            ]
        },
        "metal": {
            "brightness": 35,
            "contrast": 1.44531,
            "hue": 193,
            "saturation": 0.390625,
            "lightness": 1.40625,
            "rgb": [
                102,
                151,
                166
            ]
        }
    },
    "713": {
        "name": "Winter Frost",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 193,
            "saturation": 0.625,
            "lightness": 1.28906,
            "rgb": [
                86,
                153,
                174
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.28906,
            "hue": 193,
            "saturation": 0.546875,
            "lightness": 1.28906,
            "rgb": [
                87,
                148,
                167
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.28906,
            "hue": 193,
            "saturation": 0.46875,
            "lightness": 1.28906,
            "rgb": [
                94,
                146,
                162
            ]
        }
    },
    "691": {
        "name": "Spring Dew",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 27,
            "contrast": 1.25,
            "hue": 190,
            "saturation": 0.625,
            "lightness": 1.28906,
            "rgb": [
                72,
                143,
                159
            ]
        },
        "leather": {
            "brightness": 27,
            "contrast": 1.28906,
            "hue": 190,
            "saturation": 0.507813,
            "lightness": 1.32813,
            "rgb": [
                81,
                140,
                153
            ]
        },
        "metal": {
            "brightness": 27,
            "contrast": 1.28906,
            "hue": 190,
            "saturation": 0.46875,
            "lightness": 1.32813,
            "rgb": [
                84,
                139,
                151
            ]
        }
    },
    "10": {
        "name": "Sky",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 22,
            "contrast": 1.25,
            "hue": 196,
            "saturation": 0.742188,
            "lightness": 1.32813,
            "rgb": [
                54,
                130,
                160
            ]
        },
        "leather": {
            "brightness": 22,
            "contrast": 1.25,
            "hue": 196,
            "saturation": 0.664063,
            "lightness": 1.32813,
            "rgb": [
                61,
                129,
                156
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.28906,
            "hue": 196,
            "saturation": 0.546875,
            "lightness": 1.32813,
            "rgb": [
                65,
                123,
                146
            ]
        }
    },
    "634": {
        "name": "Midday",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.13281,
            "hue": 192,
            "saturation": 0.859375,
            "lightness": 1.17188,
            "rgb": [
                34,
                120,
                143
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.17188,
            "hue": 192,
            "saturation": 0.703125,
            "lightness": 1.17188,
            "rgb": [
                41,
                113,
                133
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.17188,
            "hue": 192,
            "saturation": 0.625,
            "lightness": 1.17188,
            "rgb": [
                47,
                111,
                129
            ]
        }
    },
    "8": {
        "name": "Robin",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 9,
            "contrast": 1.05469,
            "hue": 192,
            "saturation": 1.13281,
            "lightness": 1.09375,
            "rgb": [
                1,
                106,
                135
            ]
        },
        "leather": {
            "brightness": 9,
            "contrast": 1.05469,
            "hue": 192,
            "saturation": 0.976563,
            "lightness": 1.09375,
            "rgb": [
                12,
                102,
                128
            ]
        },
        "metal": {
            "brightness": 9,
            "contrast": 1.05469,
            "hue": 192,
            "saturation": 0.78125,
            "lightness": 1.09375,
            "rgb": [
                26,
                98,
                118
            ]
        }
    },
    "625": {
        "name": "Hydrangea",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 5,
            "contrast": 1.01563,
            "hue": 192,
            "saturation": 1.17188,
            "lightness": 1.01563,
            "rgb": [
                0,
                95,
                124
            ]
        },
        "leather": {
            "brightness": 5,
            "contrast": 1.05469,
            "hue": 192,
            "saturation": 0.898438,
            "lightness": 1.05469,
            "rgb": [
                6,
                89,
                113
            ]
        },
        "metal": {
            "brightness": 5,
            "contrast": 1.05469,
            "hue": 192,
            "saturation": 0.78125,
            "lightness": 1.05469,
            "rgb": [
                15,
                87,
                107
            ]
        }
    },
    "9": {
        "name": "Blue Rose",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1,
            "hue": 192,
            "saturation": 1.32813,
            "lightness": 0.976563,
            "rgb": [
                0,
                76,
                109
            ]
        },
        "leather": {
            "brightness": -6,
            "contrast": 1,
            "hue": 192,
            "saturation": 1.13281,
            "lightness": 1.05469,
            "rgb": [
                0,
                74,
                102
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1,
            "hue": 192,
            "saturation": 0.859375,
            "lightness": 1.05469,
            "rgb": [
                0,
                70,
                91
            ]
        }
    },
    "674": {
        "name": "Regal",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 190,
            "saturation": 1.32813,
            "lightness": 0.976563,
            "rgb": [
                0,
                64,
                91
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 190,
            "saturation": 1.05469,
            "lightness": 1.01563,
            "rgb": [
                0,
                59,
                80
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 190,
            "saturation": 0.78125,
            "lightness": 1.01563,
            "rgb": [
                0,
                52,
                68
            ]
        }
    },
    "7": {
        "name": "Ocean",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -21,
            "contrast": 1,
            "hue": 188,
            "saturation": 1.32813,
            "lightness": 0.976563,
            "rgb": [
                0,
                51,
                73
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 188,
            "saturation": 1.13281,
            "lightness": 1.05469,
            "rgb": [
                0,
                54,
                72
            ]
        },
        "metal": {
            "brightness": -18,
            "contrast": 1,
            "hue": 188,
            "saturation": 0.78125,
            "lightness": 1.01563,
            "rgb": [
                0,
                44,
                57
            ]
        }
    },
    "11": {
        "name": "Starry Night",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -30,
            "contrast": 1,
            "hue": 188,
            "saturation": 1.25,
            "lightness": 0.625,
            "rgb": [
                0,
                31,
                52
            ]
        },
        "leather": {
            "brightness": -25,
            "contrast": 1,
            "hue": 188,
            "saturation": 1.05469,
            "lightness": 0.78125,
            "rgb": [
                0,
                34,
                51
            ]
        },
        "metal": {
            "brightness": -30,
            "contrast": 1,
            "hue": 188,
            "saturation": 0.78125,
            "lightness": 0.625,
            "rgb": [
                0,
                19,
                32
            ]
        }
    },
    "587": {
        "name": "Blue Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 47,
            "contrast": 1.36719,
            "hue": 220,
            "saturation": 0.15625,
            "lightness": 1.32813,
            "rgb": [
                160,
                168,
                185
            ]
        },
        "leather": {
            "brightness": 47,
            "contrast": 1.44531,
            "hue": 220,
            "saturation": 0.15625,
            "lightness": 1.32813,
            "rgb": [
                152,
                161,
                178
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 220,
            "saturation": 0.15625,
            "lightness": 1.48438,
            "rgb": [
                150,
                160,
                180
            ]
        }
    },
    "649": {
        "name": "Pastel Blue",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 44,
            "contrast": 1.25,
            "hue": 220,
            "saturation": 0.46875,
            "lightness": 1.32813,
            "rgb": [
                143,
                167,
                211
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.32813,
            "hue": 220,
            "saturation": 0.390625,
            "lightness": 1.32813,
            "rgb": [
                134,
                155,
                194
            ]
        },
        "metal": {
            "brightness": 42,
            "contrast": 1.48438,
            "hue": 220,
            "saturation": 0.390625,
            "lightness": 1.5625,
            "rgb": [
                143,
                166,
                210
            ]
        }
    },
    "614": {
        "name": "Frost Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 40,
            "contrast": 1.25,
            "hue": 220,
            "saturation": 0.585938,
            "lightness": 1.28906,
            "rgb": [
                120,
                149,
                205
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 220,
            "saturation": 0.46875,
            "lightness": 1.32813,
            "rgb": [
                120,
                144,
                190
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 220,
            "saturation": 0.390625,
            "lightness": 1.32813,
            "rgb": [
                125,
                145,
                184
            ]
        }
    },
    "590": {
        "name": "Brook",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 35,
            "contrast": 1.25,
            "hue": 220,
            "saturation": 0.664063,
            "lightness": 1.28906,
            "rgb": [
                102,
                135,
                198
            ]
        },
        "leather": {
            "brightness": 35,
            "contrast": 1.25,
            "hue": 220,
            "saturation": 0.625,
            "lightness": 1.28906,
            "rgb": [
                104,
                136,
                195
            ]
        },
        "metal": {
            "brightness": 35,
            "contrast": 1.28906,
            "hue": 220,
            "saturation": 0.46875,
            "lightness": 1.28906,
            "rgb": [
                110,
                135,
                180
            ]
        }
    },
    "28": {
        "name": "Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 27,
            "contrast": 1.25,
            "hue": 220,
            "saturation": 0.78125,
            "lightness": 1.28906,
            "rgb": [
                74,
                113,
                187
            ]
        },
        "leather": {
            "brightness": 25,
            "contrast": 1.28906,
            "hue": 220,
            "saturation": 0.664063,
            "lightness": 1.28906,
            "rgb": [
                71,
                106,
                171
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.28906,
            "hue": 220,
            "saturation": 0.546875,
            "lightness": 1.28906,
            "rgb": [
                79,
                108,
                161
            ]
        }
    },
    "700": {
        "name": "Stream",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 22,
            "contrast": 1.21094,
            "hue": 210,
            "saturation": 0.703125,
            "lightness": 1.25,
            "rgb": [
                61,
                112,
                162
            ]
        },
        "leather": {
            "brightness": 20,
            "contrast": 1.25,
            "hue": 210,
            "saturation": 0.585938,
            "lightness": 1.25,
            "rgb": [
                60,
                103,
                146
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.25,
            "hue": 210,
            "saturation": 0.546875,
            "lightness": 1.25,
            "rgb": [
                68,
                108,
                149
            ]
        }
    },
    "676": {
        "name": "River",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.17188,
            "hue": 215,
            "saturation": 0.703125,
            "lightness": 1.25,
            "rgb": [
                56,
                98,
                153
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.21094,
            "hue": 215,
            "saturation": 0.625,
            "lightness": 1.25,
            "rgb": [
                57,
                95,
                146
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.21094,
            "hue": 215,
            "saturation": 0.585938,
            "lightness": 1.25,
            "rgb": [
                60,
                95,
                143
            ]
        }
    },
    "31": {
        "name": "Summer Sky",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 210,
            "saturation": 0.78125,
            "lightness": 1.17188,
            "rgb": [
                35,
                87,
                139
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 210,
            "saturation": 0.664063,
            "lightness": 1.17188,
            "rgb": [
                43,
                87,
                132
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 210,
            "saturation": 0.585938,
            "lightness": 1.17188,
            "rgb": [
                48,
                87,
                126
            ]
        }
    },
    "588": {
        "name": "Blue Sky",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.09375,
            "hue": 215,
            "saturation": 0.703125,
            "lightness": 1.13281,
            "rgb": [
                40,
                78,
                130
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.13281,
            "hue": 215,
            "saturation": 0.625,
            "lightness": 1.13281,
            "rgb": [
                40,
                76,
                124
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.13281,
            "hue": 215,
            "saturation": 0.507813,
            "lightness": 1.13281,
            "rgb": [
                48,
                76,
                115
            ]
        }
    },
    "27": {
        "name": "Blueberry",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 6,
            "contrast": 1.05469,
            "hue": 220,
            "saturation": 0.703125,
            "lightness": 1.09375,
            "rgb": [
                36,
                65,
                122
            ]
        },
        "leather": {
            "brightness": 6,
            "contrast": 1.09375,
            "hue": 215,
            "saturation": 0.625,
            "lightness": 1.09375,
            "rgb": [
                33,
                67,
                113
            ]
        },
        "metal": {
            "brightness": 6,
            "contrast": 1.09375,
            "hue": 215,
            "saturation": 0.507813,
            "lightness": 1.09375,
            "rgb": [
                40,
                68,
                106
            ]
        }
    },
    "583": {
        "name": "Afternoon",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 0,
            "contrast": 1.01563,
            "hue": 225,
            "saturation": 0.625,
            "lightness": 1.09375,
            "rgb": [
                33,
                53,
                106
            ]
        },
        "leather": {
            "brightness": 0,
            "contrast": 1.01563,
            "hue": 225,
            "saturation": 0.585938,
            "lightness": 1.09375,
            "rgb": [
                35,
                53,
                103
            ]
        },
        "metal": {
            "brightness": 0,
            "contrast": 1.05469,
            "hue": 225,
            "saturation": 0.390625,
            "lightness": 1.09375,
            "rgb": [
                41,
                54,
                88
            ]
        }
    },
    "30": {
        "name": "Royal Blue",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 225,
            "saturation": 0.625,
            "lightness": 1.09375,
            "rgb": [
                18,
                37,
                89
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 225,
            "saturation": 0.507813,
            "lightness": 1.09375,
            "rgb": [
                23,
                39,
                81
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 225,
            "saturation": 0.390625,
            "lightness": 1.09375,
            "rgb": [
                29,
                41,
                73
            ]
        }
    },
    "29": {
        "name": "Sapphire",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -15,
            "contrast": 1,
            "hue": 225,
            "saturation": 0.507813,
            "lightness": 0.976563,
            "rgb": [
                4,
                20,
                62
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 225,
            "saturation": 0.351563,
            "lightness": 1.01563,
            "rgb": [
                17,
                28,
                57
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 225,
            "saturation": 0.3125,
            "lightness": 0.976563,
            "rgb": [
                18,
                27,
                53
            ]
        }
    },
    "708": {
        "name": "Violet Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 47,
            "contrast": 1.36719,
            "hue": 236,
            "saturation": 0.273438,
            "lightness": 1.32813,
            "rgb": [
                157,
                160,
                196
            ]
        },
        "leather": {
            "brightness": 47,
            "contrast": 1.48438,
            "hue": 236,
            "saturation": 0.273438,
            "lightness": 1.32813,
            "rgb": [
                145,
                148,
                188
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 236,
            "saturation": 0.273438,
            "lightness": 1.48438,
            "rgb": [
                146,
                150,
                194
            ]
        }
    },
    "662": {
        "name": "Pastel Violet",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 47,
            "contrast": 1.25,
            "hue": 236,
            "saturation": 0.507813,
            "lightness": 1.25,
            "rgb": [
                147,
                152,
                214
            ]
        },
        "leather": {
            "brightness": 47,
            "contrast": 1.36719,
            "hue": 236,
            "saturation": 0.390625,
            "lightness": 1.25,
            "rgb": [
                140,
                145,
                197
            ]
        },
        "metal": {
            "brightness": 42,
            "contrast": 1.48438,
            "hue": 236,
            "saturation": 0.390625,
            "lightness": 1.5625,
            "rgb": [
                151,
                156,
                212
            ]
        }
    },
    "707": {
        "name": "Violet Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 42,
            "contrast": 1.25,
            "hue": 236,
            "saturation": 0.507813,
            "lightness": 1.25,
            "rgb": [
                134,
                139,
                201
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.36719,
            "hue": 236,
            "saturation": 0.507813,
            "lightness": 1.32813,
            "rgb": [
                118,
                124,
                191
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.36719,
            "hue": 236,
            "saturation": 0.390625,
            "lightness": 1.32813,
            "rgb": [
                124,
                128,
                181
            ]
        }
    },
    "684": {
        "name": "Shy Lilac",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 236,
            "saturation": 0.546875,
            "lightness": 1.25,
            "rgb": [
                120,
                125,
                192
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 236,
            "saturation": 0.546875,
            "lightness": 1.25,
            "rgb": [
                116,
                121,
                190
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 236,
            "saturation": 0.390625,
            "lightness": 1.25,
            "rgb": [
                123,
                127,
                177
            ]
        }
    },
    "141": {
        "name": "Lilac",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 29,
            "contrast": 1.28906,
            "hue": 238,
            "saturation": 0.585938,
            "lightness": 1.36719,
            "rgb": [
                107,
                110,
                185
            ]
        },
        "leather": {
            "brightness": 29,
            "contrast": 1.32813,
            "hue": 238,
            "saturation": 0.546875,
            "lightness": 1.36719,
            "rgb": [
                104,
                107,
                180
            ]
        },
        "metal": {
            "brightness": 29,
            "contrast": 1.32813,
            "hue": 238,
            "saturation": 0.46875,
            "lightness": 1.36719,
            "rgb": [
                108,
                110,
                173
            ]
        }
    },
    "640": {
        "name": "Mountain Sky",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 30,
            "contrast": 1.25,
            "hue": 236,
            "saturation": 0.625,
            "lightness": 1.25,
            "rgb": [
                99,
                105,
                181
            ]
        },
        "leather": {
            "brightness": 28,
            "contrast": 1.28906,
            "hue": 236,
            "saturation": 0.507813,
            "lightness": 1.25,
            "rgb": [
                95,
                100,
                164
            ]
        },
        "metal": {
            "brightness": 30,
            "contrast": 1.28906,
            "hue": 236,
            "saturation": 0.507813,
            "lightness": 1.25,
            "rgb": [
                100,
                105,
                169
            ]
        }
    },
    "603": {
        "name": "Deep Lilac",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 26,
            "contrast": 1.21094,
            "hue": 236,
            "saturation": 0.625,
            "lightness": 1.21094,
            "rgb": [
                89,
                95,
                169
            ]
        },
        "leather": {
            "brightness": 26,
            "contrast": 1.21094,
            "hue": 236,
            "saturation": 0.585938,
            "lightness": 1.21094,
            "rgb": [
                91,
                97,
                166
            ]
        },
        "metal": {
            "brightness": 26,
            "contrast": 1.25,
            "hue": 236,
            "saturation": 0.46875,
            "lightness": 1.21094,
            "rgb": [
                92,
                97,
                154
            ]
        }
    },
    "142": {
        "name": "Periwinkle",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 19,
            "contrast": 1.13281,
            "hue": 236,
            "saturation": 0.625,
            "lightness": 1.17188,
            "rgb": [
                77,
                83,
                152
            ]
        },
        "leather": {
            "brightness": 19,
            "contrast": 1.13281,
            "hue": 236,
            "saturation": 0.585938,
            "lightness": 1.17188,
            "rgb": [
                79,
                84,
                149
            ]
        },
        "metal": {
            "brightness": 19,
            "contrast": 1.13281,
            "hue": 236,
            "saturation": 0.46875,
            "lightness": 1.17188,
            "rgb": [
                84,
                88,
                140
            ]
        }
    },
    "626": {
        "name": "Lavender",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1,
            "hue": 238,
            "saturation": 0.585938,
            "lightness": 1.09375,
            "rgb": [
                66,
                68,
                127
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.05469,
            "hue": 238,
            "saturation": 0.546875,
            "lightness": 1.09375,
            "rgb": [
                62,
                65,
                122
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.05469,
            "hue": 238,
            "saturation": 0.429688,
            "lightness": 1.09375,
            "rgb": [
                67,
                68,
                114
            ]
        }
    },
    "139": {
        "name": "Violet",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 4,
            "contrast": 1,
            "hue": 240,
            "saturation": 0.625,
            "lightness": 1.09375,
            "rgb": [
                53,
                53,
                116
            ]
        },
        "leather": {
            "brightness": 4,
            "contrast": 1,
            "hue": 240,
            "saturation": 0.585938,
            "lightness": 1.09375,
            "rgb": [
                54,
                54,
                114
            ]
        },
        "metal": {
            "brightness": 4,
            "contrast": 1,
            "hue": 240,
            "saturation": 0.46875,
            "lightness": 1.09375,
            "rgb": [
                58,
                58,
                106
            ]
        }
    },
    "644": {
        "name": "Nightsong",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 4,
            "contrast": 1,
            "hue": 248,
            "saturation": 0.507813,
            "lightness": 1.01563,
            "rgb": [
                56,
                47,
                103
            ]
        },
        "leather": {
            "brightness": 4,
            "contrast": 1,
            "hue": 248,
            "saturation": 0.46875,
            "lightness": 1.01563,
            "rgb": [
                57,
                49,
                100
            ]
        },
        "metal": {
            "brightness": 4,
            "contrast": 1,
            "hue": 248,
            "saturation": 0.390625,
            "lightness": 1.01563,
            "rgb": [
                59,
                52,
                95
            ]
        }
    },
    "140": {
        "name": "Iris",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1,
            "hue": 248,
            "saturation": 0.507813,
            "lightness": 1.01563,
            "rgb": [
                41,
                33,
                89
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 248,
            "saturation": 0.429688,
            "lightness": 1.01563,
            "rgb": [
                43,
                36,
                83
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1,
            "hue": 248,
            "saturation": 0.351563,
            "lightness": 1.01563,
            "rgb": [
                45,
                40,
                78
            ]
        }
    },
    "143": {
        "name": "Royal Purple",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -12,
            "contrast": 1,
            "hue": 242,
            "saturation": 0.429688,
            "lightness": 0.976563,
            "rgb": [
                21,
                19,
                64
            ]
        },
        "leather": {
            "brightness": -12,
            "contrast": 1,
            "hue": 242,
            "saturation": 0.351563,
            "lightness": 0.976563,
            "rgb": [
                23,
                22,
                59
            ]
        },
        "metal": {
            "brightness": -12,
            "contrast": 1,
            "hue": 242,
            "saturation": 0.273438,
            "lightness": 0.976563,
            "rgb": [
                26,
                25,
                53
            ]
        }
    },
    "672": {
        "name": "Purple Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 50,
            "contrast": 1.36719,
            "hue": 265,
            "saturation": 0.195313,
            "lightness": 1.32813,
            "rgb": [
                177,
                164,
                195
            ]
        },
        "leather": {
            "brightness": 47,
            "contrast": 1.44531,
            "hue": 265,
            "saturation": 0.195313,
            "lightness": 1.32813,
            "rgb": [
                162,
                148,
                181
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 265,
            "saturation": 0.195313,
            "lightness": 1.48438,
            "rgb": [
                162,
                146,
                183
            ]
        }
    },
    "658": {
        "name": "Pastel Purple",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 47,
            "contrast": 1.25,
            "hue": 265,
            "saturation": 0.3125,
            "lightness": 1.25,
            "rgb": [
                168,
                149,
                195
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.28906,
            "hue": 265,
            "saturation": 0.3125,
            "lightness": 1.25,
            "rgb": [
                153,
                132,
                180
            ]
        },
        "metal": {
            "brightness": 42,
            "contrast": 1.48438,
            "hue": 265,
            "saturation": 0.3125,
            "lightness": 1.5625,
            "rgb": [
                170,
                147,
                202
            ]
        }
    },
    "671": {
        "name": "Purple Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 42,
            "contrast": 1.25,
            "hue": 265,
            "saturation": 0.390625,
            "lightness": 1.25,
            "rgb": [
                155,
                131,
                188
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 265,
            "saturation": 0.351563,
            "lightness": 1.25,
            "rgb": [
                140,
                117,
                170
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 265,
            "saturation": 0.3125,
            "lightness": 1.25,
            "rgb": [
                140,
                120,
                167
            ]
        }
    },
    "685": {
        "name": "Shylac",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 265,
            "saturation": 0.390625,
            "lightness": 1.25,
            "rgb": [
                143,
                119,
                176
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.28906,
            "hue": 265,
            "saturation": 0.351563,
            "lightness": 1.25,
            "rgb": [
                127,
                105,
                158
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.28906,
            "hue": 265,
            "saturation": 0.273438,
            "lightness": 1.25,
            "rgb": [
                128,
                110,
                152
            ]
        }
    },
    "118": {
        "name": "Thistle",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 31,
            "contrast": 1.25,
            "hue": 265,
            "saturation": 0.539063,
            "lightness": 1.27344,
            "rgb": [
                129,
                96,
                175
            ]
        },
        "leather": {
            "brightness": 31,
            "contrast": 1.25,
            "hue": 265,
            "saturation": 0.429688,
            "lightness": 1.27344,
            "rgb": [
                130,
                103,
                166
            ]
        },
        "metal": {
            "brightness": 31,
            "contrast": 1.25,
            "hue": 265,
            "saturation": 0.390625,
            "lightness": 1.27344,
            "rgb": [
                130,
                106,
                163
            ]
        }
    },
    "701": {
        "name": "Summer Thistle",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 25,
            "contrast": 1.17188,
            "hue": 264,
            "saturation": 0.46875,
            "lightness": 1.25,
            "rgb": [
                118,
                92,
                157
            ]
        },
        "leather": {
            "brightness": 25,
            "contrast": 1.21094,
            "hue": 264,
            "saturation": 0.429688,
            "lightness": 1.25,
            "rgb": [
                115,
                90,
                151
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.21094,
            "hue": 264,
            "saturation": 0.351563,
            "lightness": 1.25,
            "rgb": [
                116,
                96,
                146
            ]
        }
    },
    "706": {
        "name": "Veronica",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 18,
            "contrast": 1.09375,
            "hue": 263,
            "saturation": 0.46875,
            "lightness": 1.25,
            "rgb": [
                107,
                84,
                144
            ]
        },
        "leather": {
            "brightness": 18,
            "contrast": 1.13281,
            "hue": 263,
            "saturation": 0.429688,
            "lightness": 1.25,
            "rgb": [
                104,
                82,
                139
            ]
        },
        "metal": {
            "brightness": 18,
            "contrast": 1.13281,
            "hue": 263,
            "saturation": 0.351563,
            "lightness": 1.25,
            "rgb": [
                105,
                87,
                133
            ]
        }
    },
    "116": {
        "name": "Iris Blush",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 14,
            "contrast": 1.09375,
            "hue": 260,
            "saturation": 0.546875,
            "lightness": 1.25,
            "rgb": [
                94,
                70,
                140
            ]
        },
        "leather": {
            "brightness": 14,
            "contrast": 1.13281,
            "hue": 260,
            "saturation": 0.507813,
            "lightness": 1.25,
            "rgb": [
                91,
                68,
                135
            ]
        },
        "metal": {
            "brightness": 14,
            "contrast": 1.17188,
            "hue": 260,
            "saturation": 0.351563,
            "lightness": 1.25,
            "rgb": [
                90,
                73,
                121
            ]
        }
    },
    "589": {
        "name": "Blurple",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 8,
            "contrast": 1.04688,
            "hue": 265,
            "saturation": 0.507813,
            "lightness": 1.17188,
            "rgb": [
                82,
                55,
                118
            ]
        },
        "leather": {
            "brightness": 8,
            "contrast": 1.0625,
            "hue": 265,
            "saturation": 0.46875,
            "lightness": 1.17188,
            "rgb": [
                81,
                56,
                114
            ]
        },
        "metal": {
            "brightness": 8,
            "contrast": 1.0625,
            "hue": 265,
            "saturation": 0.351563,
            "lightness": 1.17188,
            "rgb": [
                81,
                63,
                107
            ]
        }
    },
    "114": {
        "name": "Grapevine",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 2,
            "contrast": 1,
            "hue": 270,
            "saturation": 0.507813,
            "lightness": 1.09375,
            "rgb": [
                69,
                40,
                99
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1,
            "hue": 270,
            "saturation": 0.429688,
            "lightness": 1.09375,
            "rgb": [
                69,
                44,
                95
            ]
        },
        "metal": {
            "brightness": 2,
            "contrast": 1,
            "hue": 270,
            "saturation": 0.351563,
            "lightness": 1.09375,
            "rgb": [
                69,
                49,
                90
            ]
        }
    },
    "675": {
        "name": "Rich Grape",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -1,
            "contrast": 1,
            "hue": 268,
            "saturation": 0.429688,
            "lightness": 1.05469,
            "rgb": [
                60,
                36,
                86
            ]
        },
        "leather": {
            "brightness": -1,
            "contrast": 1,
            "hue": 268,
            "saturation": 0.351563,
            "lightness": 1.05469,
            "rgb": [
                60,
                40,
                82
            ]
        },
        "metal": {
            "brightness": -1,
            "contrast": 1,
            "hue": 268,
            "saturation": 0.273438,
            "lightness": 1.05469,
            "rgb": [
                60,
                45,
                77
            ]
        }
    },
    "117": {
        "name": "Orchid",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1,
            "hue": 265,
            "saturation": 0.429688,
            "lightness": 1.01563,
            "rgb": [
                48,
                26,
                77
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1,
            "hue": 265,
            "saturation": 0.351563,
            "lightness": 1.01563,
            "rgb": [
                48,
                31,
                72
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1,
            "hue": 265,
            "saturation": 0.273438,
            "lightness": 1.01563,
            "rgb": [
                49,
                35,
                67
            ]
        }
    },
    "115": {
        "name": "Indigo",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1,
            "hue": 265,
            "saturation": 0.390625,
            "lightness": 0.9375,
            "rgb": [
                35,
                15,
                61
            ]
        },
        "leather": {
            "brightness": -10,
            "contrast": 1,
            "hue": 265,
            "saturation": 0.3125,
            "lightness": 0.9375,
            "rgb": [
                35,
                20,
                56
            ]
        },
        "metal": {
            "brightness": -10,
            "contrast": 1,
            "hue": 265,
            "saturation": 0.195313,
            "lightness": 0.9375,
            "rgb": [
                36,
                26,
                49
            ]
        }
    },
    "711": {
        "name": "Wine Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 50,
            "contrast": 1.36719,
            "hue": 295,
            "saturation": 0.234375,
            "lightness": 1.32813,
            "rgb": [
                188,
                157,
                191
            ]
        },
        "leather": {
            "brightness": 45,
            "contrast": 1.40625,
            "hue": 295,
            "saturation": 0.234375,
            "lightness": 1.32813,
            "rgb": [
                172,
                140,
                175
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 295,
            "saturation": 0.234375,
            "lightness": 1.48438,
            "rgb": [
                174,
                137,
                178
            ]
        }
    },
    "663": {
        "name": "Pastel Wine",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 45,
            "contrast": 1.25,
            "hue": 295,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                184,
                141,
                188
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.28906,
            "hue": 295,
            "saturation": 0.3125,
            "lightness": 1.28906,
            "rgb": [
                171,
                132,
                175
            ]
        },
        "metal": {
            "brightness": 45,
            "contrast": 1.64063,
            "hue": 295,
            "saturation": 0.273438,
            "lightness": 1.48438,
            "rgb": [
                170,
                127,
                175
            ]
        }
    },
    "710": {
        "name": "Wine Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 40,
            "contrast": 1.25,
            "hue": 295,
            "saturation": 0.390625,
            "lightness": 1.28906,
            "rgb": [
                172,
                125,
                177
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 295,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                160,
                116,
                165
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.48438,
            "hue": 295,
            "saturation": 0.3125,
            "lightness": 1.44531,
            "rgb": [
                159,
                114,
                164
            ]
        }
    },
    "620": {
        "name": "Heliotrope",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 35,
            "contrast": 1.25,
            "hue": 295,
            "saturation": 0.507813,
            "lightness": 1.28906,
            "rgb": [
                163,
                102,
                170
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.28906,
            "hue": 295,
            "saturation": 0.390625,
            "lightness": 1.28906,
            "rgb": [
                148,
                100,
                154
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.36719,
            "hue": 295,
            "saturation": 0.3125,
            "lightness": 1.36719,
            "rgb": [
                147,
                106,
                152
            ]
        }
    },
    "50": {
        "name": "Plum",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 295,
            "saturation": 0.539063,
            "lightness": 1.28906,
            "rgb": [
                157,
                92,
                164
            ]
        },
        "leather": {
            "brightness": 27,
            "contrast": 1.28906,
            "hue": 295,
            "saturation": 0.429688,
            "lightness": 1.28906,
            "rgb": [
                137,
                84,
                143
            ]
        },
        "metal": {
            "brightness": 27,
            "contrast": 1.28906,
            "hue": 295,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                134,
                90,
                139
            ]
        }
    },
    "667": {
        "name": "Phlox",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 23,
            "contrast": 1.17188,
            "hue": 295,
            "saturation": 0.546875,
            "lightness": 1.25,
            "rgb": [
                136,
                74,
                142
            ]
        },
        "leather": {
            "brightness": 23,
            "contrast": 1.21094,
            "hue": 295,
            "saturation": 0.46875,
            "lightness": 1.25,
            "rgb": [
                130,
                76,
                136
            ]
        },
        "metal": {
            "brightness": 23,
            "contrast": 1.21094,
            "hue": 295,
            "saturation": 0.351563,
            "lightness": 1.25,
            "rgb": [
                126,
                85,
                131
            ]
        }
    },
    "49": {
        "name": "Morning Glory",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.13281,
            "hue": 295,
            "saturation": 0.625,
            "lightness": 1.19531,
            "rgb": [
                121,
                53,
                129
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.17188,
            "hue": 295,
            "saturation": 0.507813,
            "lightness": 1.19531,
            "rgb": [
                115,
                58,
                121
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.17188,
            "hue": 295,
            "saturation": 0.429688,
            "lightness": 1.19531,
            "rgb": [
                112,
                64,
                118
            ]
        }
    },
    "615": {
        "name": "Glory",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.01563,
            "hue": 295,
            "saturation": 0.585938,
            "lightness": 1.17188,
            "rgb": [
                102,
                45,
                108
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 295,
            "saturation": 0.546875,
            "lightness": 1.17188,
            "rgb": [
                98,
                43,
                104
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 295,
            "saturation": 0.351563,
            "lightness": 1.17188,
            "rgb": [
                93,
                57,
                96
            ]
        }
    },
    "48": {
        "name": "Grape Gum",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 0,
            "contrast": 1,
            "hue": 296,
            "saturation": 0.664063,
            "lightness": 1.25,
            "rgb": [
                94,
                29,
                100
            ]
        },
        "leather": {
            "brightness": 0,
            "contrast": 1,
            "hue": 296,
            "saturation": 0.507813,
            "lightness": 1.25,
            "rgb": [
                90,
                40,
                94
            ]
        },
        "metal": {
            "brightness": 0,
            "contrast": 1,
            "hue": 296,
            "saturation": 0.507813,
            "lightness": 1.25,
            "rgb": [
                90,
                40,
                94
            ]
        }
    },
    "670": {
        "name": "Purple",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 0,
            "contrast": 1,
            "hue": 300,
            "saturation": 0.546875,
            "lightness": 1.09375,
            "rgb": [
                84,
                28,
                84
            ]
        },
        "leather": {
            "brightness": 0,
            "contrast": 1,
            "hue": 300,
            "saturation": 0.46875,
            "lightness": 1.09375,
            "rgb": [
                81,
                33,
                81
            ]
        },
        "metal": {
            "brightness": 0,
            "contrast": 1,
            "hue": 300,
            "saturation": 0.390625,
            "lightness": 1.09375,
            "rgb": [
                78,
                39,
                78
            ]
        }
    },
    "47": {
        "name": "Grape",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1,
            "hue": 305,
            "saturation": 0.507813,
            "lightness": 0.9375,
            "rgb": [
                70,
                16,
                65
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 305,
            "saturation": 0.390625,
            "lightness": 0.9375,
            "rgb": [
                65,
                24,
                61
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1,
            "hue": 305,
            "saturation": 0.351563,
            "lightness": 0.9375,
            "rgb": [
                64,
                26,
                60
            ]
        }
    },
    "609": {
        "name": "Evening Wine",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 310,
            "saturation": 0.390625,
            "lightness": 0.9375,
            "rgb": [
                58,
                15,
                50
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 310,
            "saturation": 0.273438,
            "lightness": 0.9375,
            "rgb": [
                53,
                22,
                47
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 310,
            "saturation": 0.273438,
            "lightness": 0.9375,
            "rgb": [
                53,
                22,
                47
            ]
        }
    },
    "51": {
        "name": "Wine",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -14,
            "contrast": 1,
            "hue": 315,
            "saturation": 0.3125,
            "lightness": 0.9375,
            "rgb": [
                45,
                9,
                35
            ]
        },
        "leather": {
            "brightness": -14,
            "contrast": 1,
            "hue": 315,
            "saturation": 0.273438,
            "lightness": 0.9375,
            "rgb": [
                43,
                12,
                34
            ]
        },
        "metal": {
            "brightness": -14,
            "contrast": 1,
            "hue": 315,
            "saturation": 0.234375,
            "lightness": 0.9375,
            "rgb": [
                41,
                14,
                34
            ]
        }
    },
    "679": {
        "name": "Rose Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 50,
            "contrast": 1.36719,
            "hue": 333,
            "saturation": 0.273438,
            "lightness": 1.32813,
            "rgb": [
                201,
                158,
                178
            ]
        },
        "leather": {
            "brightness": 47,
            "contrast": 1.44531,
            "hue": 333,
            "saturation": 0.15625,
            "lightness": 1.32813,
            "rgb": [
                177,
                151,
                163
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 333,
            "saturation": 0.195313,
            "lightness": 1.48438,
            "rgb": [
                183,
                145,
                162
            ]
        }
    },
    "659": {
        "name": "Pastel Rose",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 45,
            "contrast": 1.25,
            "hue": 333,
            "saturation": 0.429688,
            "lightness": 1.28906,
            "rgb": [
                203,
                140,
                169
            ]
        },
        "leather": {
            "brightness": 45,
            "contrast": 1.25,
            "hue": 333,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                198,
                146,
                169
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.64063,
            "hue": 333,
            "saturation": 0.273438,
            "lightness": 1.5625,
            "rgb": [
                199,
                146,
                170
            ]
        }
    },
    "678": {
        "name": "Rose Breeze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.25,
            "hue": 333,
            "saturation": 0.507813,
            "lightness": 1.28906,
            "rgb": [
                189,
                114,
                148
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 333,
            "saturation": 0.429688,
            "lightness": 1.28906,
            "rgb": [
                180,
                115,
                145
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 333,
            "saturation": 0.390625,
            "lightness": 1.28906,
            "rgb": [
                177,
                118,
                145
            ]
        }
    },
    "624": {
        "name": "Humiliation",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 333,
            "saturation": 0.546875,
            "lightness": 1.32813,
            "rgb": [
                183,
                103,
                139
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.28906,
            "hue": 333,
            "saturation": 0.46875,
            "lightness": 1.32813,
            "rgb": [
                175,
                104,
                136
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.28906,
            "hue": 333,
            "saturation": 0.429688,
            "lightness": 1.32813,
            "rgb": [
                172,
                106,
                136
            ]
        }
    },
    "124": {
        "name": "Cotton Candy",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.25,
            "hue": 336,
            "saturation": 0.625,
            "lightness": 1.25,
            "rgb": [
                182,
                90,
                128
            ]
        },
        "leather": {
            "brightness": 30,
            "contrast": 1.28906,
            "hue": 336,
            "saturation": 0.507813,
            "lightness": 1.25,
            "rgb": [
                166,
                89,
                120
            ]
        },
        "metal": {
            "brightness": 30,
            "contrast": 1.28906,
            "hue": 336,
            "saturation": 0.429688,
            "lightness": 1.25,
            "rgb": [
                159,
                94,
                121
            ]
        }
    },
    "619": {
        "name": "Heather",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 24,
            "contrast": 1.25,
            "hue": 338,
            "saturation": 0.703125,
            "lightness": 1.36719,
            "rgb": [
                179,
                77,
                116
            ]
        },
        "leather": {
            "brightness": 22,
            "contrast": 1.28906,
            "hue": 338,
            "saturation": 0.546875,
            "lightness": 1.36719,
            "rgb": [
                159,
                77,
                108
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.28906,
            "hue": 338,
            "saturation": 0.507813,
            "lightness": 1.36719,
            "rgb": [
                156,
                80,
                109
            ]
        }
    },
    "666": {
        "name": "Persephone",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.21094,
            "hue": 340,
            "saturation": 0.742188,
            "lightness": 1.40625,
            "rgb": [
                169,
                65,
                101
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.21094,
            "hue": 340,
            "saturation": 0.625,
            "lightness": 1.40625,
            "rgb": [
                160,
                72,
                103
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.21094,
            "hue": 340,
            "saturation": 0.546875,
            "lightness": 1.40625,
            "rgb": [
                154,
                77,
                104
            ]
        }
    },
    "126": {
        "name": "Hot Pink",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 14,
            "contrast": 1.21094,
            "hue": 340,
            "saturation": 0.820313,
            "lightness": 1.44531,
            "rgb": [
                169,
                54,
                94
            ]
        },
        "leather": {
            "brightness": 14,
            "contrast": 1.21094,
            "hue": 340,
            "saturation": 0.703125,
            "lightness": 1.44531,
            "rgb": [
                160,
                62,
                96
            ]
        },
        "metal": {
            "brightness": 14,
            "contrast": 1.21094,
            "hue": 340,
            "saturation": 0.585938,
            "lightness": 1.44531,
            "rgb": [
                151,
                69,
                98
            ]
        }
    },
    "641": {
        "name": "Mullberry",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 335,
            "saturation": 0.78125,
            "lightness": 1.17188,
            "rgb": [
                142,
                38,
                82
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 335,
            "saturation": 0.664063,
            "lightness": 1.17188,
            "rgb": [
                134,
                45,
                83
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 335,
            "saturation": 0.585938,
            "lightness": 1.17188,
            "rgb": [
                128,
                50,
                83
            ]
        }
    },
    "125": {
        "name": "Fuchsia",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -2,
            "contrast": 1,
            "hue": 333,
            "saturation": 0.78125,
            "lightness": 1.25,
            "rgb": [
                117,
                25,
                67
            ]
        },
        "leather": {
            "brightness": -2,
            "contrast": 1,
            "hue": 333,
            "saturation": 0.664063,
            "lightness": 1.25,
            "rgb": [
                110,
                32,
                67
            ]
        },
        "metal": {
            "brightness": -2,
            "contrast": 1,
            "hue": 333,
            "saturation": 0.546875,
            "lightness": 1.25,
            "rgb": [
                103,
                38,
                68
            ]
        }
    },
    "680": {
        "name": "Royal Rose",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -7,
            "contrast": 1,
            "hue": 330,
            "saturation": 0.742188,
            "lightness": 1.17188,
            "rgb": [
                97,
                10,
                53
            ]
        },
        "leather": {
            "brightness": -7,
            "contrast": 1,
            "hue": 330,
            "saturation": 0.585938,
            "lightness": 1.17188,
            "rgb": [
                88,
                19,
                53
            ]
        },
        "metal": {
            "brightness": -7,
            "contrast": 1,
            "hue": 330,
            "saturation": 0.507813,
            "lightness": 1.17188,
            "rgb": [
                83,
                24,
                53
            ]
        }
    },
    "127": {
        "name": "Lipstick",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 328,
            "saturation": 0.703125,
            "lightness": 1.09375,
            "rgb": [
                77,
                0,
                38
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 328,
            "saturation": 0.585938,
            "lightness": 1.09375,
            "rgb": [
                70,
                2,
                38
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 328,
            "saturation": 0.507813,
            "lightness": 1.09375,
            "rgb": [
                66,
                6,
                38
            ]
        }
    },
    "128": {
        "name": "Maroon",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 320,
            "saturation": 0.546875,
            "lightness": 0.78125,
            "rgb": [
                47,
                0,
                25
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 320,
            "saturation": 0.507813,
            "lightness": 0.78125,
            "rgb": [
                45,
                0,
                24
            ]
        },
        "metal": {
            "brightness": -18,
            "contrast": 1,
            "hue": 320,
            "saturation": 0.390625,
            "lightness": 0.78125,
            "rgb": [
                39,
                0,
                23
            ]
        }
    },
    "343": {
        "name": "Flush",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 0,
            "saturation": 0.609375,
            "lightness": 1.99219,
            "rgb": [
                185,
                107,
                107
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 0,
            "saturation": 0.570313,
            "lightness": 1.75781,
            "rgb": [
                183,
                111,
                111
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.44531,
            "hue": 0,
            "saturation": 0.507813,
            "lightness": 1.75781,
            "rgb": [
                190,
                115,
                115
            ]
        }
    },
    "102": {
        "name": "Strawberry Cream",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 22,
            "contrast": 1.32031,
            "hue": 13,
            "saturation": 0.664063,
            "lightness": 1.5625,
            "rgb": [
                186,
                111,
                87
            ]
        },
        "leather": {
            "brightness": 22,
            "contrast": 1.32031,
            "hue": 13,
            "saturation": 0.703125,
            "lightness": 1.5625,
            "rgb": [
                189,
                110,
                85
            ]
        },
        "metal": {
            "brightness": 20,
            "contrast": 1.25,
            "hue": 13,
            "saturation": 0.570313,
            "lightness": 1.5625,
            "rgb": [
                176,
                115,
                96
            ]
        }
    },
    "344": {
        "name": "Orange Frost",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 14,
            "contrast": 1.25,
            "hue": 25,
            "saturation": 0.625,
            "lightness": 1.99219,
            "rgb": [
                189,
                136,
                97
            ]
        },
        "leather": {
            "brightness": 18,
            "contrast": 1.25,
            "hue": 25,
            "saturation": 0.585938,
            "lightness": 1.75781,
            "rgb": [
                184,
                134,
                98
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.44531,
            "hue": 25,
            "saturation": 0.585938,
            "lightness": 1.75781,
            "rgb": [
                192,
                135,
                92
            ]
        }
    },
    "345": {
        "name": "Lemon Zest",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 14,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.703125,
            "lightness": 1.99219,
            "rgb": [
                187,
                151,
                85
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.546875,
            "lightness": 1.75781,
            "rgb": [
                170,
                143,
                91
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.44531,
            "hue": 40,
            "saturation": 0.546875,
            "lightness": 1.75781,
            "rgb": [
                181,
                149,
                89
            ]
        }
    },
    "346": {
        "name": "Quickstalk",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 65,
            "saturation": 0.453125,
            "lightness": 1.99219,
            "rgb": [
                149,
                155,
                95
            ]
        },
        "leather": {
            "brightness": 18,
            "contrast": 1.25,
            "hue": 65,
            "saturation": 0.421875,
            "lightness": 1.75781,
            "rgb": [
                154,
                159,
                103
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.44531,
            "hue": 65,
            "saturation": 0.421875,
            "lightness": 1.75781,
            "rgb": [
                157,
                163,
                98
            ]
        }
    },
    "347": {
        "name": "Spring",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 90,
            "saturation": 0.335938,
            "lightness": 1.99219,
            "rgb": [
                125,
                150,
                100
            ]
        },
        "leather": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 90,
            "saturation": 0.3125,
            "lightness": 1.75781,
            "rgb": [
                128,
                151,
                105
            ]
        },
        "metal": {
            "brightness": 23,
            "contrast": 1.44531,
            "hue": 90,
            "saturation": 0.3125,
            "lightness": 1.75781,
            "rgb": [
                133,
                159,
                106
            ]
        }
    },
    "348": {
        "name": "Wintermint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 145,
            "saturation": 0.296875,
            "lightness": 1.99219,
            "rgb": [
                104,
                148,
                123
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 145,
            "saturation": 0.273438,
            "lightness": 1.75781,
            "rgb": [
                116,
                156,
                133
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.44531,
            "hue": 145,
            "saturation": 0.273438,
            "lightness": 1.75781,
            "rgb": [
                118,
                164,
                137
            ]
        }
    },
    "349": {
        "name": "Dapple",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 190,
            "saturation": 0.335938,
            "lightness": 1.99219,
            "rgb": [
                105,
                143,
                151
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 190,
            "saturation": 0.3125,
            "lightness": 1.75781,
            "rgb": [
                109,
                144,
                152
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.44531,
            "hue": 190,
            "saturation": 0.3125,
            "lightness": 1.75781,
            "rgb": [
                109,
                150,
                159
            ]
        }
    },
    "350": {
        "name": "Dewdrop",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 235,
            "saturation": 0.335938,
            "lightness": 1.99219,
            "rgb": [
                117,
                121,
                161
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 235,
            "saturation": 0.28125,
            "lightness": 1.75781,
            "rgb": [
                121,
                125,
                159
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.44531,
            "hue": 235,
            "saturation": 0.28125,
            "lightness": 1.75781,
            "rgb": [
                124,
                128,
                167
            ]
        }
    },
    "351": {
        "name": "Scenic",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 280,
            "saturation": 0.3125,
            "lightness": 1.99219,
            "rgb": [
                138,
                108,
                153
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 280,
            "saturation": 0.273438,
            "lightness": 1.75781,
            "rgb": [
                139,
                113,
                153
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.44531,
            "hue": 280,
            "saturation": 0.273438,
            "lightness": 1.75781,
            "rgb": [
                144,
                114,
                160
            ]
        }
    },
    "352": {
        "name": "Demure",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 10,
            "saturation": 0.546875,
            "lightness": 1.32813,
            "rgb": [
                148,
                86,
                72
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 10,
            "saturation": 0.492188,
            "lightness": 1.36719,
            "rgb": [
                146,
                90,
                78
            ]
        },
        "metal": {
            "brightness": 24,
            "contrast": 1.44531,
            "hue": 10,
            "saturation": 0.507813,
            "lightness": 1.36719,
            "rgb": [
                155,
                89,
                74
            ]
        }
    },
    "332": {
        "name": "Shy Peach",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 25,
            "saturation": 0.585938,
            "lightness": 1.44531,
            "rgb": [
                156,
                106,
                70
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 25,
            "saturation": 0.546875,
            "lightness": 1.44531,
            "rgb": [
                153,
                107,
                73
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.44531,
            "hue": 25,
            "saturation": 0.546875,
            "lightness": 1.44531,
            "rgb": [
                163,
                110,
                71
            ]
        }
    },
    "333": {
        "name": "Sand",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.546875,
            "lightness": 1.44531,
            "rgb": [
                146,
                119,
                67
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.507813,
            "lightness": 1.44531,
            "rgb": [
                144,
                118,
                70
            ]
        },
        "metal": {
            "brightness": 24,
            "contrast": 1.44531,
            "hue": 40,
            "saturation": 0.507813,
            "lightness": 1.44531,
            "rgb": [
                150,
                120,
                65
            ]
        }
    },
    "334": {
        "name": "Tang",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 55,
            "saturation": 0.507813,
            "lightness": 1.44531,
            "rgb": [
                130,
                123,
                62
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 55,
            "saturation": 0.46875,
            "lightness": 1.44531,
            "rgb": [
                134,
                128,
                71
            ]
        },
        "metal": {
            "brightness": 24,
            "contrast": 1.44531,
            "hue": 55,
            "saturation": 0.453125,
            "lightness": 1.44531,
            "rgb": [
                137,
                131,
                67
            ]
        }
    },
    "359": {
        "name": "Celery",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 75,
            "saturation": 0.335938,
            "lightness": 1.32813,
            "rgb": [
                109,
                122,
                74
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 75,
            "saturation": 0.3125,
            "lightness": 1.36719,
            "rgb": [
                112,
                124,
                79
            ]
        },
        "metal": {
            "brightness": 24,
            "contrast": 1.44531,
            "hue": 75,
            "saturation": 0.3125,
            "lightness": 1.36719,
            "rgb": [
                114,
                127,
                76
            ]
        }
    },
    "360": {
        "name": "Mist",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 115,
            "saturation": 0.21875,
            "lightness": 1.32813,
            "rgb": [
                94,
                120,
                91
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 115,
            "saturation": 0.195313,
            "lightness": 1.36719,
            "rgb": [
                98,
                121,
                95
            ]
        },
        "metal": {
            "brightness": 24,
            "contrast": 1.44531,
            "hue": 115,
            "saturation": 0.195313,
            "lightness": 1.36719,
            "rgb": [
                98,
                125,
                95
            ]
        }
    },
    "361": {
        "name": "Night Air",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.13281,
            "hue": 170,
            "saturation": 0.257813,
            "lightness": 1.40625,
            "rgb": [
                80,
                112,
                106
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 170,
            "saturation": 0.234375,
            "lightness": 1.40625,
            "rgb": [
                87,
                117,
                111
            ]
        },
        "metal": {
            "brightness": 24,
            "contrast": 1.44531,
            "hue": 170,
            "saturation": 0.195313,
            "lightness": 1.40625,
            "rgb": [
                90,
                121,
                115
            ]
        }
    },
    "362": {
        "name": "Winter Sky",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.13281,
            "hue": 200,
            "saturation": 0.265625,
            "lightness": 1.40625,
            "rgb": [
                80,
                103,
                115
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 200,
            "saturation": 0.234375,
            "lightness": 1.40625,
            "rgb": [
                88,
                108,
                119
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.44531,
            "hue": 200,
            "saturation": 0.195313,
            "lightness": 1.40625,
            "rgb": [
                94,
                115,
                126
            ]
        }
    },
    "363": {
        "name": "Hush",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 235,
            "saturation": 0.21875,
            "lightness": 1.32813,
            "rgb": [
                91,
                94,
                120
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 235,
            "saturation": 0.203125,
            "lightness": 1.32813,
            "rgb": [
                92,
                94,
                119
            ]
        },
        "metal": {
            "brightness": 24,
            "contrast": 1.44531,
            "hue": 235,
            "saturation": 0.203125,
            "lightness": 1.36719,
            "rgb": [
                94,
                97,
                126
            ]
        }
    },
    "364": {
        "name": "Taro",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.09375,
            "hue": 325,
            "saturation": 0.257813,
            "lightness": 1.44531,
            "rgb": [
                113,
                80,
                99
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.09375,
            "hue": 325,
            "saturation": 0.234375,
            "lightness": 1.44531,
            "rgb": [
                112,
                81,
                99
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.36719,
            "hue": 325,
            "saturation": 0.203125,
            "lightness": 1.44531,
            "rgb": [
                115,
                82,
                101
            ]
        }
    },
    "35": {
        "name": "Peach",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 8,
            "contrast": 1.25,
            "hue": 15,
            "saturation": 0.507813,
            "lightness": 1.99219,
            "rgb": [
                159,
                106,
                87
            ]
        },
        "leather": {
            "brightness": 14,
            "contrast": 1.25,
            "hue": 15,
            "saturation": 0.492188,
            "lightness": 1.75781,
            "rgb": [
                165,
                113,
                95
            ]
        },
        "metal": {
            "brightness": 8,
            "contrast": 1.25,
            "hue": 15,
            "saturation": 0.546875,
            "lightness": 1.99219,
            "rgb": [
                162,
                105,
                84
            ]
        }
    },
    "32": {
        "name": "Blush",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 5,
            "contrast": 1,
            "hue": 8,
            "saturation": 0.46875,
            "lightness": 1.25,
            "rgb": [
                119,
                75,
                67
            ]
        },
        "leather": {
            "brightness": 6,
            "contrast": 1,
            "hue": 8,
            "saturation": 0.429688,
            "lightness": 1.36719,
            "rgb": [
                127,
                87,
                80
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 8,
            "saturation": 0.507813,
            "lightness": 1.36719,
            "rgb": [
                132,
                82,
                73
            ]
        }
    },
    "36": {
        "name": "Peach Sunset",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.05469,
            "hue": 10,
            "saturation": 0.742188,
            "lightness": 1.28906,
            "rgb": [
                150,
                80,
                64
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.05469,
            "hue": 10,
            "saturation": 0.664063,
            "lightness": 1.36719,
            "rgb": [
                151,
                88,
                73
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.05469,
            "hue": 10,
            "saturation": 0.742188,
            "lightness": 1.28906,
            "rgb": [
                150,
                80,
                64
            ]
        }
    },
    "33": {
        "name": "Bold",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 5,
            "contrast": 1,
            "hue": 8,
            "saturation": 0.742188,
            "lightness": 1.21094,
            "rgb": [
                134,
                65,
                53
            ]
        },
        "leather": {
            "brightness": 6,
            "contrast": 1,
            "hue": 8,
            "saturation": 0.703125,
            "lightness": 1.28906,
            "rgb": [
                140,
                74,
                63
            ]
        },
        "metal": {
            "brightness": 5,
            "contrast": 1,
            "hue": 8,
            "saturation": 0.742188,
            "lightness": 1.21094,
            "rgb": [
                134,
                65,
                53
            ]
        }
    },
    "34": {
        "name": "Dusky",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 8,
            "saturation": 0.625,
            "lightness": 1.17188,
            "rgb": [
                93,
                35,
                25
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 8,
            "saturation": 0.585938,
            "lightness": 1.25,
            "rgb": [
                94,
                40,
                30
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 8,
            "saturation": 0.585938,
            "lightness": 1.25,
            "rgb": [
                94,
                40,
                30
            ]
        }
    },
    "365": {
        "name": "Crush",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 0,
            "saturation": 0.546875,
            "lightness": 1.28906,
            "rgb": [
                129,
                70,
                70
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 0,
            "saturation": 0.507813,
            "lightness": 1.36719,
            "rgb": [
                132,
                77,
                77
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 0,
            "saturation": 0.546875,
            "lightness": 1.36719,
            "rgb": [
                135,
                76,
                76
            ]
        }
    },
    "434": {
        "name": "Pumpkin",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 0,
            "contrast": 1.05469,
            "hue": 23,
            "saturation": 0.585938,
            "lightness": 1.28906,
            "rgb": [
                111,
                67,
                38
            ]
        },
        "leather": {
            "brightness": 0,
            "contrast": 1.05469,
            "hue": 23,
            "saturation": 0.546875,
            "lightness": 1.36719,
            "rgb": [
                113,
                72,
                45
            ]
        },
        "metal": {
            "brightness": 0,
            "contrast": 1.05469,
            "hue": 23,
            "saturation": 0.625,
            "lightness": 1.36719,
            "rgb": [
                118,
                71,
                41
            ]
        }
    },
    "366": {
        "name": "Squash",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 5,
            "contrast": 1.05469,
            "hue": 32,
            "saturation": 0.546875,
            "lightness": 1.28906,
            "rgb": [
                118,
                86,
                50
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 32,
            "saturation": 0.546875,
            "lightness": 1.28906,
            "rgb": [
                123,
                91,
                55
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.17188,
            "hue": 32,
            "saturation": 0.585938,
            "lightness": 1.28906,
            "rgb": [
                132,
                94,
                51
            ]
        }
    },
    "435": {
        "name": "Dijon",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1,
            "hue": 40,
            "saturation": 0.507813,
            "lightness": 1.28906,
            "rgb": [
                90,
                70,
                32
            ]
        },
        "leather": {
            "brightness": -2,
            "contrast": 1,
            "hue": 40,
            "saturation": 0.546875,
            "lightness": 1.36719,
            "rgb": [
                105,
                83,
                41
            ]
        },
        "metal": {
            "brightness": -2,
            "contrast": 1,
            "hue": 40,
            "saturation": 0.546875,
            "lightness": 1.36719,
            "rgb": [
                105,
                83,
                41
            ]
        }
    },
    "367": {
        "name": "Fern",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1.05469,
            "hue": 50,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                75,
                68,
                34
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 50,
            "saturation": 0.351563,
            "lightness": 1.32813,
            "rgb": [
                82,
                75,
                41
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 50,
            "saturation": 0.351563,
            "lightness": 1.32813,
            "rgb": [
                82,
                75,
                41
            ]
        }
    },
    "436": {
        "name": "Remembrance",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1,
            "hue": 0,
            "saturation": 0.429688,
            "lightness": 1.21094,
            "rgb": [
                77,
                33,
                33
            ]
        },
        "leather": {
            "brightness": -6,
            "contrast": 1,
            "hue": 0,
            "saturation": 0.429688,
            "lightness": 1.28906,
            "rgb": [
                91,
                47,
                47
            ]
        },
        "metal": {
            "brightness": -4,
            "contrast": 1,
            "hue": 0,
            "saturation": 0.585938,
            "lightness": 1.36719,
            "rgb": [
                110,
                51,
                51
            ]
        }
    },
    "368": {
        "name": "Warmth",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1.05469,
            "hue": 13,
            "saturation": 0.507813,
            "lightness": 1.28906,
            "rgb": [
                87,
                41,
                27
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 13,
            "saturation": 0.492188,
            "lightness": 1.28906,
            "rgb": [
                99,
                54,
                40
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 13,
            "saturation": 0.546875,
            "lightness": 1.36719,
            "rgb": [
                106,
                57,
                41
            ]
        }
    },
    "437": {
        "name": "Pumpkin Pie",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1.05469,
            "hue": 23,
            "saturation": 0.507813,
            "lightness": 1.28906,
            "rgb": [
                85,
                47,
                22
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 23,
            "saturation": 0.507813,
            "lightness": 1.28906,
            "rgb": [
                98,
                60,
                35
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 23,
            "saturation": 0.585938,
            "lightness": 1.28906,
            "rgb": [
                103,
                59,
                31
            ]
        }
    },
    "369": {
        "name": "Peanut Butter",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1.05469,
            "hue": 36,
            "saturation": 0.664063,
            "lightness": 1.28906,
            "rgb": [
                90,
                56,
                8
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 36,
            "saturation": 0.625,
            "lightness": 1.28906,
            "rgb": [
                101,
                69,
                23
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 36,
            "saturation": 0.625,
            "lightness": 1.28906,
            "rgb": [
                101,
                69,
                23
            ]
        }
    },
    "438": {
        "name": "Moss",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -12,
            "contrast": 1,
            "hue": 65,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                56,
                60,
                22
            ]
        },
        "leather": {
            "brightness": -7,
            "contrast": 1,
            "hue": 65,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                69,
                73,
                35
            ]
        },
        "metal": {
            "brightness": -7,
            "contrast": 1,
            "hue": 65,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                69,
                73,
                35
            ]
        }
    },
    "53": {
        "name": "Ceylon",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.17188,
            "hue": 85,
            "saturation": 0.390625,
            "lightness": 1.25,
            "rgb": [
                88,
                110,
                57
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.17188,
            "hue": 85,
            "saturation": 0.390625,
            "lightness": 1.40625,
            "rgb": [
                104,
                127,
                73
            ]
        },
        "metal": {
            "brightness": 18,
            "contrast": 1.36719,
            "hue": 85,
            "saturation": 0.351563,
            "lightness": 1.40625,
            "rgb": [
                102,
                126,
                70
            ]
        }
    },
    "129": {
        "name": "Green Apple",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1,
            "hue": 78,
            "saturation": 0.585938,
            "lightness": 1.13281,
            "rgb": [
                64,
                86,
                18
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 78,
            "saturation": 0.507813,
            "lightness": 1.36719,
            "rgb": [
                81,
                99,
                40
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1,
            "hue": 78,
            "saturation": 0.507813,
            "lightness": 1.36719,
            "rgb": [
                81,
                99,
                40
            ]
        }
    },
    "370": {
        "name": "Envy",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 69,
            "saturation": 0.625,
            "lightness": 1.01563,
            "rgb": [
                39,
                51,
                0
            ]
        },
        "leather": {
            "brightness": -9,
            "contrast": 1,
            "hue": 69,
            "saturation": 0.429688,
            "lightness": 1.17188,
            "rgb": [
                59,
                67,
                20
            ]
        },
        "metal": {
            "brightness": -9,
            "contrast": 1,
            "hue": 69,
            "saturation": 0.429688,
            "lightness": 1.17188,
            "rgb": [
                59,
                67,
                20
            ]
        }
    },
    "57": {
        "name": "Kelly",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 115,
            "saturation": 0.3125,
            "lightness": 0.976563,
            "rgb": [
                14,
                44,
                11
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 100,
            "saturation": 0.273438,
            "lightness": 1.09375,
            "rgb": [
                33,
                54,
                22
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 100,
            "saturation": 0.273438,
            "lightness": 1.09375,
            "rgb": [
                33,
                54,
                22
            ]
        }
    },
    "60": {
        "name": "Spearmint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 160,
            "saturation": 0.273438,
            "lightness": 0.976563,
            "rgb": [
                15,
                47,
                36
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 160,
            "saturation": 0.257813,
            "lightness": 1.01563,
            "rgb": [
                28,
                58,
                47
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 160,
            "saturation": 0.257813,
            "lightness": 1.01563,
            "rgb": [
                28,
                58,
                47
            ]
        }
    },
    "42": {
        "name": "Frosted Sea",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.09375,
            "hue": 175,
            "saturation": 0.195313,
            "lightness": 1.28906,
            "rgb": [
                72,
                95,
                93
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.09375,
            "hue": 175,
            "saturation": 0.195313,
            "lightness": 1.32813,
            "rgb": [
                83,
                106,
                103
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.44531,
            "hue": 175,
            "saturation": 0.195313,
            "lightness": 1.32813,
            "rgb": [
                78,
                108,
                106
            ]
        }
    },
    "41": {
        "name": "Eucalyptus",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1,
            "hue": 175,
            "saturation": 0.234375,
            "lightness": 1.21094,
            "rgb": [
                49,
                74,
                72
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1,
            "hue": 175,
            "saturation": 0.203125,
            "lightness": 1.21094,
            "rgb": [
                63,
                85,
                83
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 175,
            "saturation": 0.203125,
            "lightness": 1.21094,
            "rgb": [
                63,
                91,
                88
            ]
        }
    },
    "45": {
        "name": "Tea Jeans",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 186,
            "saturation": 0.195313,
            "lightness": 1.21094,
            "rgb": [
                40,
                58,
                61
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 186,
            "saturation": 0.195313,
            "lightness": 1.21094,
            "rgb": [
                52,
                70,
                73
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1,
            "hue": 186,
            "saturation": 0.195313,
            "lightness": 1.21094,
            "rgb": [
                52,
                70,
                73
            ]
        }
    },
    "43": {
        "name": "Old Jeans",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 215,
            "saturation": 0.195313,
            "lightness": 1.17188,
            "rgb": [
                40,
                50,
                63
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1,
            "hue": 215,
            "saturation": 0.195313,
            "lightness": 1.17188,
            "rgb": [
                47,
                57,
                70
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1,
            "hue": 215,
            "saturation": 0.195313,
            "lightness": 1.17188,
            "rgb": [
                47,
                57,
                70
            ]
        }
    },
    "40": {
        "name": "Dusty Grape",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -6,
            "contrast": 1,
            "hue": 235,
            "saturation": 0.234375,
            "lightness": 1.17188,
            "rgb": [
                47,
                49,
                72
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 235,
            "saturation": 0.234375,
            "lightness": 1.17188,
            "rgb": [
                54,
                56,
                79
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1,
            "hue": 235,
            "saturation": 0.234375,
            "lightness": 1.17188,
            "rgb": [
                54,
                56,
                79
            ]
        }
    },
    "37": {
        "name": "Autumn Sky",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 20,
            "contrast": 1.25,
            "hue": 220,
            "saturation": 0.273438,
            "lightness": 1.28906,
            "rgb": [
                89,
                102,
                128
            ]
        },
        "leather": {
            "brightness": 22,
            "contrast": 1.25,
            "hue": 220,
            "saturation": 0.257813,
            "lightness": 1.28906,
            "rgb": [
                95,
                108,
                132
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.25,
            "hue": 220,
            "saturation": 0.257813,
            "lightness": 1.28906,
            "rgb": [
                95,
                108,
                132
            ]
        }
    },
    "46": {
        "name": "Denim",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 210,
            "saturation": 0.335938,
            "lightness": 1.17188,
            "rgb": [
                61,
                82,
                103
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 210,
            "saturation": 0.3125,
            "lightness": 1.25,
            "rgb": [
                68,
                87,
                107
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 210,
            "saturation": 0.3125,
            "lightness": 1.25,
            "rgb": [
                68,
                87,
                107
            ]
        }
    },
    "44": {
        "name": "Shy Blue",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 2,
            "contrast": 1,
            "hue": 195,
            "saturation": 0.429688,
            "lightness": 1.17188,
            "rgb": [
                46,
                82,
                95
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1,
            "hue": 195,
            "saturation": 0.390625,
            "lightness": 1.25,
            "rgb": [
                54,
                86,
                98
            ]
        },
        "metal": {
            "brightness": 2,
            "contrast": 1,
            "hue": 195,
            "saturation": 0.390625,
            "lightness": 1.25,
            "rgb": [
                54,
                86,
                98
            ]
        }
    },
    "38": {
        "name": "Country Blue",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1,
            "hue": 210,
            "saturation": 0.3125,
            "lightness": 1.21094,
            "rgb": [
                46,
                65,
                83
            ]
        },
        "leather": {
            "brightness": 0,
            "contrast": 1,
            "hue": 210,
            "saturation": 0.3125,
            "lightness": 1.21094,
            "rgb": [
                54,
                72,
                91
            ]
        },
        "metal": {
            "brightness": 0,
            "contrast": 1,
            "hue": 210,
            "saturation": 0.3125,
            "lightness": 1.21094,
            "rgb": [
                54,
                72,
                91
            ]
        }
    },
    "39": {
        "name": "Country Teal",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 196,
            "saturation": 0.3125,
            "lightness": 1.21094,
            "rgb": [
                32,
                58,
                68
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 196,
            "saturation": 0.3125,
            "lightness": 1.21094,
            "rgb": [
                44,
                70,
                80
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1,
            "hue": 196,
            "saturation": 0.3125,
            "lightness": 1.21094,
            "rgb": [
                44,
                70,
                80
            ]
        }
    },
    "439": {
        "name": "Shy Iris",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 5,
            "contrast": 1.05469,
            "hue": 255,
            "saturation": 0.21875,
            "lightness": 1.28906,
            "rgb": [
                81,
                74,
                100
            ]
        },
        "leather": {
            "brightness": 8,
            "contrast": 1.05469,
            "hue": 255,
            "saturation": 0.195313,
            "lightness": 1.28906,
            "rgb": [
                89,
                83,
                106
            ]
        },
        "metal": {
            "brightness": 8,
            "contrast": 1.05469,
            "hue": 255,
            "saturation": 0.195313,
            "lightness": 1.28906,
            "rgb": [
                89,
                83,
                106
            ]
        }
    },
    "371": {
        "name": "Grapesicle",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 2,
            "contrast": 1.05469,
            "hue": 285,
            "saturation": 0.21875,
            "lightness": 1.17188,
            "rgb": [
                74,
                55,
                81
            ]
        },
        "leather": {
            "brightness": 6,
            "contrast": 1.05469,
            "hue": 285,
            "saturation": 0.21875,
            "lightness": 1.17188,
            "rgb": [
                84,
                64,
                91
            ]
        },
        "metal": {
            "brightness": 6,
            "contrast": 1.05469,
            "hue": 285,
            "saturation": 0.21875,
            "lightness": 1.17188,
            "rgb": [
                84,
                64,
                91
            ]
        }
    },
    "440": {
        "name": "Evening",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1.05469,
            "hue": 280,
            "saturation": 0.195313,
            "lightness": 1.13281,
            "rgb": [
                54,
                39,
                63
            ]
        },
        "leather": {
            "brightness": 0,
            "contrast": 1.05469,
            "hue": 280,
            "saturation": 0.195313,
            "lightness": 1.13281,
            "rgb": [
                66,
                50,
                74
            ]
        },
        "metal": {
            "brightness": 0,
            "contrast": 1.05469,
            "hue": 280,
            "saturation": 0.195313,
            "lightness": 1.13281,
            "rgb": [
                66,
                50,
                74
            ]
        }
    },
    "372": {
        "name": "Night Iris",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1.05469,
            "hue": 255,
            "saturation": 0.195313,
            "lightness": 1.13281,
            "rgb": [
                48,
                42,
                65
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 255,
            "saturation": 0.179688,
            "lightness": 1.13281,
            "rgb": [
                53,
                47,
                69
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 255,
            "saturation": 0.179688,
            "lightness": 1.13281,
            "rgb": [
                53,
                47,
                69
            ]
        }
    },
    "441": {
        "name": "Brandywine",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1,
            "hue": 320,
            "saturation": 0.257813,
            "lightness": 1.17188,
            "rgb": [
                72,
                42,
                61
            ]
        },
        "leather": {
            "brightness": -2,
            "contrast": 1,
            "hue": 320,
            "saturation": 0.234375,
            "lightness": 1.17188,
            "rgb": [
                77,
                50,
                68
            ]
        },
        "metal": {
            "brightness": -2,
            "contrast": 1,
            "hue": 320,
            "saturation": 0.257813,
            "lightness": 1.17188,
            "rgb": [
                79,
                49,
                68
            ]
        }
    },
    "20": {
        "name": "Ivory",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 11,
            "contrast": 1.25,
            "hue": 36,
            "saturation": 0.3125,
            "lightness": 1.99219,
            "rgb": [
                150,
                132,
                105
            ]
        },
        "leather": {
            "brightness": 11,
            "contrast": 1.25,
            "hue": 36,
            "saturation": 0.3125,
            "lightness": 1.99219,
            "rgb": [
                150,
                132,
                105
            ]
        },
        "metal": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 36,
            "saturation": 0.351563,
            "lightness": 1.99219,
            "rgb": [
                169,
                148,
                118
            ]
        }
    },
    "23": {
        "name": "Rawhide",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 15,
            "contrast": 1.17188,
            "hue": 33,
            "saturation": 0.429688,
            "lightness": 1.25,
            "rgb": [
                126,
                99,
                67
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.09375,
            "hue": 33,
            "saturation": 0.429688,
            "lightness": 1.25,
            "rgb": [
                123,
                98,
                68
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.09375,
            "hue": 33,
            "saturation": 0.453125,
            "lightness": 1.40625,
            "rgb": [
                137,
                110,
                79
            ]
        }
    },
    "22": {
        "name": "Natural",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -2,
            "contrast": 1,
            "hue": 36,
            "saturation": 0.257813,
            "lightness": 1.28906,
            "rgb": [
                86,
                74,
                56
            ]
        },
        "leather": {
            "brightness": -2,
            "contrast": 1,
            "hue": 36,
            "saturation": 0.257813,
            "lightness": 1.28906,
            "rgb": [
                86,
                74,
                56
            ]
        },
        "metal": {
            "brightness": -2,
            "contrast": 1,
            "hue": 36,
            "saturation": 0.257813,
            "lightness": 1.52344,
            "rgb": [
                99,
                87,
                69
            ]
        }
    },
    "14": {
        "name": "Camel",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 0,
            "contrast": 1.09375,
            "hue": 28,
            "saturation": 0.351563,
            "lightness": 1.21094,
            "rgb": [
                88,
                64,
                42
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 28,
            "saturation": 0.375,
            "lightness": 1.21094,
            "rgb": [
                87,
                64,
                43
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1,
            "hue": 28,
            "saturation": 0.375,
            "lightness": 1.44531,
            "rgb": [
                100,
                77,
                56
            ]
        }
    },
    "26": {
        "name": "Wheat",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 0,
            "contrast": 1.09375,
            "hue": 34,
            "saturation": 0.492188,
            "lightness": 1.21094,
            "rgb": [
                95,
                67,
                32
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 34,
            "saturation": 0.492188,
            "lightness": 1.21094,
            "rgb": [
                93,
                67,
                35
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1,
            "hue": 34,
            "saturation": 0.507813,
            "lightness": 1.44531,
            "rgb": [
                106,
                80,
                47
            ]
        }
    },
    "13": {
        "name": "Calfskin",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 34,
            "saturation": 0.3125,
            "lightness": 1.09375,
            "rgb": [
                65,
                49,
                29
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 34,
            "saturation": 0.3125,
            "lightness": 1.09375,
            "rgb": [
                65,
                49,
                29
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1,
            "hue": 34,
            "saturation": 0.3125,
            "lightness": 1.17188,
            "rgb": [
                80,
                64,
                44
            ]
        }
    },
    "17": {
        "name": "Pottery",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -6,
            "contrast": 1.05469,
            "hue": 26,
            "saturation": 0.390625,
            "lightness": 1.05469,
            "rgb": [
                71,
                44,
                23
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 28,
            "saturation": 0.390625,
            "lightness": 1.05469,
            "rgb": [
                69,
                45,
                23
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 28,
            "saturation": 0.390625,
            "lightness": 1.28906,
            "rgb": [
                80,
                55,
                34
            ]
        }
    },
    "18": {
        "name": "Earthen",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -16,
            "contrast": 1,
            "hue": 32,
            "saturation": 0.429688,
            "lightness": 1.05469,
            "rgb": [
                54,
                30,
                3
            ]
        },
        "leather": {
            "brightness": -16,
            "contrast": 1,
            "hue": 32,
            "saturation": 0.429688,
            "lightness": 1.05469,
            "rgb": [
                54,
                30,
                3
            ]
        },
        "metal": {
            "brightness": -10,
            "contrast": 1,
            "hue": 32,
            "saturation": 0.429688,
            "lightness": 1.17188,
            "rgb": [
                71,
                47,
                21
            ]
        }
    },
    "16": {
        "name": "Chocolate",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 25,
            "saturation": 0.296875,
            "lightness": 1.01563,
            "rgb": [
                42,
                22,
                7
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 25,
            "saturation": 0.296875,
            "lightness": 1.01563,
            "rgb": [
                42,
                22,
                7
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 25,
            "saturation": 0.296875,
            "lightness": 1.25,
            "rgb": [
                60,
                40,
                25
            ]
        }
    },
    "25": {
        "name": "Walnut",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 45,
            "saturation": 0.203125,
            "lightness": 1.01563,
            "rgb": [
                34,
                27,
                11
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 45,
            "saturation": 0.203125,
            "lightness": 1.01563,
            "rgb": [
                34,
                27,
                11
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 45,
            "saturation": 0.203125,
            "lightness": 1.17188,
            "rgb": [
                49,
                43,
                26
            ]
        }
    },
    "15": {
        "name": "Charcoal",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 45,
            "saturation": 0.078125,
            "lightness": 1.05469,
            "rgb": [
                39,
                37,
                30
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 45,
            "saturation": 0.078125,
            "lightness": 1.05469,
            "rgb": [
                50,
                47,
                41
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 45,
            "saturation": 0.078125,
            "lightness": 1.28906,
            "rgb": [
                60,
                58,
                51
            ]
        }
    },
    "19": {
        "name": "Ebony",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 50,
            "saturation": 0.117188,
            "lightness": 1.09375,
            "rgb": [
                53,
                50,
                40
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 50,
            "saturation": 0.117188,
            "lightness": 1.09375,
            "rgb": [
                53,
                50,
                40
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 50,
            "saturation": 0.117188,
            "lightness": 1.09375,
            "rgb": [
                53,
                50,
                40
            ]
        }
    },
    "24": {
        "name": "Terracotta",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 2,
            "contrast": 1.09375,
            "hue": 22,
            "saturation": 0.523438,
            "lightness": 1.13281,
            "rgb": [
                101,
                59,
                34
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1.09375,
            "hue": 22,
            "saturation": 0.523438,
            "lightness": 1.13281,
            "rgb": [
                101,
                59,
                34
            ]
        },
        "metal": {
            "brightness": 5,
            "contrast": 1.09375,
            "hue": 22,
            "saturation": 0.523438,
            "lightness": 1.17188,
            "rgb": [
                110,
                69,
                43
            ]
        }
    },
    "12": {
        "name": "Adobe",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -12,
            "contrast": 1,
            "hue": 20,
            "saturation": 0.492188,
            "lightness": 1.13281,
            "rgb": [
                72,
                34,
                15
            ]
        },
        "leather": {
            "brightness": -12,
            "contrast": 1,
            "hue": 20,
            "saturation": 0.492188,
            "lightness": 1.13281,
            "rgb": [
                72,
                34,
                15
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1,
            "hue": 20,
            "saturation": 0.492188,
            "lightness": 1.17188,
            "rgb": [
                90,
                52,
                32
            ]
        }
    },
    "21": {
        "name": "Mahogany",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 16,
            "saturation": 0.351563,
            "lightness": 1.05469,
            "rgb": [
                48,
                19,
                8
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 16,
            "saturation": 0.351563,
            "lightness": 1.05469,
            "rgb": [
                48,
                19,
                8
            ]
        },
        "metal": {
            "brightness": -12,
            "contrast": 1,
            "hue": 16,
            "saturation": 0.351563,
            "lightness": 1.21094,
            "rgb": [
                66,
                37,
                26
            ]
        }
    },
    "383": {
        "name": "Mohair",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 2,
            "contrast": 1.09375,
            "hue": 28,
            "saturation": 0.46875,
            "lightness": 1.17188,
            "rgb": [
                98,
                66,
                37
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1.09375,
            "hue": 28,
            "saturation": 0.46875,
            "lightness": 1.17188,
            "rgb": [
                98,
                66,
                37
            ]
        },
        "metal": {
            "brightness": 5,
            "contrast": 1.09375,
            "hue": 28,
            "saturation": 0.507813,
            "lightness": 1.21094,
            "rgb": [
                110,
                75,
                45
            ]
        }
    },
    "452": {
        "name": "Cashmere",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 8,
            "contrast": 1.13281,
            "hue": 40,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                107,
                91,
                60
            ]
        },
        "leather": {
            "brightness": 5,
            "contrast": 1.05469,
            "hue": 40,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                104,
                89,
                61
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.05469,
            "hue": 40,
            "saturation": 0.351563,
            "lightness": 1.28906,
            "rgb": [
                109,
                94,
                66
            ]
        }
    },
    "457": {
        "name": "Clay",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1.05469,
            "hue": 38,
            "saturation": 0.3125,
            "lightness": 1.28906,
            "rgb": [
                77,
                62,
                38
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1.05469,
            "hue": 38,
            "saturation": 0.3125,
            "lightness": 1.28906,
            "rgb": [
                77,
                62,
                38
            ]
        },
        "metal": {
            "brightness": -1,
            "contrast": 1.05469,
            "hue": 38,
            "saturation": 0.3125,
            "lightness": 1.28906,
            "rgb": [
                87,
                73,
                49
            ]
        }
    },
    "465": {
        "name": "Shale",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1.05469,
            "hue": 50,
            "saturation": 0.195313,
            "lightness": 1.21094,
            "rgb": [
                57,
                53,
                34
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1.05469,
            "hue": 50,
            "saturation": 0.195313,
            "lightness": 1.21094,
            "rgb": [
                57,
                53,
                34
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.05469,
            "hue": 50,
            "saturation": 0.195313,
            "lightness": 1.25,
            "rgb": [
                71,
                67,
                49
            ]
        }
    },
    "470": {
        "name": "Marine",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -17,
            "contrast": 1,
            "hue": 45,
            "saturation": 0.273438,
            "lightness": 1.17188,
            "rgb": [
                43,
                35,
                12
            ]
        },
        "leather": {
            "brightness": -17,
            "contrast": 1,
            "hue": 45,
            "saturation": 0.273438,
            "lightness": 1.17188,
            "rgb": [
                43,
                35,
                12
            ]
        },
        "metal": {
            "brightness": -12,
            "contrast": 1,
            "hue": 45,
            "saturation": 0.273438,
            "lightness": 1.17188,
            "rgb": [
                55,
                46,
                24
            ]
        }
    },
    "479": {
        "name": "Latte",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 28,
            "saturation": 0.351563,
            "lightness": 1.40625,
            "rgb": [
                129,
                101,
                77
            ]
        },
        "leather": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 28,
            "saturation": 0.351563,
            "lightness": 1.40625,
            "rgb": [
                129,
                101,
                77
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 28,
            "saturation": 0.390625,
            "lightness": 1.40625,
            "rgb": [
                137,
                107,
                80
            ]
        }
    },
    "478": {
        "name": "Beige",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 4,
            "contrast": 1.09375,
            "hue": 22,
            "saturation": 0.273438,
            "lightness": 1.28906,
            "rgb": [
                98,
                76,
                63
            ]
        },
        "leather": {
            "brightness": 4,
            "contrast": 1.09375,
            "hue": 22,
            "saturation": 0.273438,
            "lightness": 1.28906,
            "rgb": [
                98,
                76,
                63
            ]
        },
        "metal": {
            "brightness": 8,
            "contrast": 1.09375,
            "hue": 22,
            "saturation": 0.351563,
            "lightness": 1.36719,
            "rgb": [
                119,
                91,
                74
            ]
        }
    },
    "384": {
        "name": "Mocha",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1.05469,
            "hue": 20,
            "saturation": 0.234375,
            "lightness": 1.28906,
            "rgb": [
                75,
                56,
                46
            ]
        },
        "leather": {
            "brightness": -2,
            "contrast": 1.05469,
            "hue": 20,
            "saturation": 0.234375,
            "lightness": 1.28906,
            "rgb": [
                83,
                64,
                54
            ]
        },
        "metal": {
            "brightness": 1,
            "contrast": 1.05469,
            "hue": 20,
            "saturation": 0.273438,
            "lightness": 1.28906,
            "rgb": [
                93,
                71,
                60
            ]
        }
    },
    "453": {
        "name": "Taupe",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1.09375,
            "hue": 20,
            "saturation": 0.195313,
            "lightness": 1.17188,
            "rgb": [
                57,
                41,
                32
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1.09375,
            "hue": 20,
            "saturation": 0.195313,
            "lightness": 1.17188,
            "rgb": [
                64,
                48,
                39
            ]
        },
        "metal": {
            "brightness": -2,
            "contrast": 1.09375,
            "hue": 20,
            "saturation": 0.273438,
            "lightness": 1.25,
            "rgb": [
                81,
                58,
                46
            ]
        }
    },
    "456": {
        "name": "Cocoa",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1.05469,
            "hue": 15,
            "saturation": 0.15625,
            "lightness": 1.09375,
            "rgb": [
                33,
                19,
                14
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1.05469,
            "hue": 15,
            "saturation": 0.15625,
            "lightness": 1.09375,
            "rgb": [
                43,
                30,
                25
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1.05469,
            "hue": 15,
            "saturation": 0.195313,
            "lightness": 1.09375,
            "rgb": [
                57,
                40,
                34
            ]
        }
    },
    "94": {
        "name": "Frosting",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 11,
            "contrast": 1.17188,
            "hue": 38,
            "saturation": 0.25,
            "lightness": 1.99219,
            "rgb": [
                155,
                142,
                121
            ]
        },
        "leather": {
            "brightness": 4,
            "contrast": 1,
            "hue": 38,
            "saturation": 0.273438,
            "lightness": 1.99219,
            "rgb": [
                150,
                138,
                118
            ]
        },
        "metal": {
            "brightness": 4,
            "contrast": 1,
            "hue": 38,
            "saturation": 0.273438,
            "lightness": 1.99219,
            "rgb": [
                150,
                138,
                118
            ]
        }
    },
    "90": {
        "name": "Cream",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 26,
            "saturation": 0.273438,
            "lightness": 1.99219,
            "rgb": [
                154,
                131,
                114
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 26,
            "saturation": 0.273438,
            "lightness": 1.99219,
            "rgb": [
                154,
                131,
                114
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 26,
            "saturation": 0.273438,
            "lightness": 1.99219,
            "rgb": [
                154,
                131,
                114
            ]
        }
    },
    "91": {
        "name": "Cream Shade",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 38,
            "saturation": 0.28125,
            "lightness": 1.44531,
            "rgb": [
                124,
                108,
                83
            ]
        },
        "leather": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 38,
            "saturation": 0.28125,
            "lightness": 1.44531,
            "rgb": [
                124,
                108,
                83
            ]
        },
        "metal": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 38,
            "saturation": 0.28125,
            "lightness": 1.44531,
            "rgb": [
                124,
                108,
                83
            ]
        }
    },
    "373": {
        "name": "Malt",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 35,
            "saturation": 0.195313,
            "lightness": 1.48438,
            "rgb": [
                127,
                115,
                99
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 35,
            "saturation": 0.195313,
            "lightness": 1.48438,
            "rgb": [
                127,
                115,
                99
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 35,
            "saturation": 0.195313,
            "lightness": 1.48438,
            "rgb": [
                127,
                115,
                99
            ]
        }
    },
    "442": {
        "name": "Matte",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 50,
            "saturation": 0.15625,
            "lightness": 1.99219,
            "rgb": [
                142,
                138,
                120
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 50,
            "saturation": 0.15625,
            "lightness": 1.99219,
            "rgb": [
                142,
                138,
                120
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 50,
            "saturation": 0.15625,
            "lightness": 1.99219,
            "rgb": [
                142,
                138,
                120
            ]
        }
    },
    "335": {
        "name": "Pale",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 10,
            "saturation": 0.195313,
            "lightness": 1.75781,
            "rgb": [
                134,
                112,
                107
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 10,
            "saturation": 0.15625,
            "lightness": 1.75781,
            "rgb": [
                130,
                113,
                109
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 10,
            "saturation": 0.234375,
            "lightness": 1.75781,
            "rgb": [
                137,
                110,
                104
            ]
        }
    },
    "336": {
        "name": "Refresh",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.28125,
            "lightness": 1.75781,
            "rgb": [
                153,
                139,
                112
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.28125,
            "lightness": 1.75781,
            "rgb": [
                153,
                139,
                112
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.28125,
            "lightness": 1.75781,
            "rgb": [
                153,
                139,
                112
            ]
        }
    },
    "444": {
        "name": "Olive Silk",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 43,
            "saturation": 0.257813,
            "lightness": 1.75781,
            "rgb": [
                133,
                122,
                96
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 43,
            "saturation": 0.257813,
            "lightness": 1.75781,
            "rgb": [
                133,
                122,
                96
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 43,
            "saturation": 0.257813,
            "lightness": 1.75781,
            "rgb": [
                133,
                122,
                96
            ]
        }
    },
    "337": {
        "name": "Far Mountain",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 18,
            "saturation": 0.234375,
            "lightness": 1.48438,
            "rgb": [
                118,
                95,
                84
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 18,
            "saturation": 0.234375,
            "lightness": 1.48438,
            "rgb": [
                118,
                95,
                84
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 18,
            "saturation": 0.3125,
            "lightness": 1.48438,
            "rgb": [
                124,
                93,
                79
            ]
        }
    },
    "445": {
        "name": "Mint Frost",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 14,
            "contrast": 1.25,
            "hue": 85,
            "saturation": 0.15625,
            "lightness": 1.99219,
            "rgb": [
                142,
                152,
                129
            ]
        },
        "leather": {
            "brightness": 14,
            "contrast": 1.25,
            "hue": 85,
            "saturation": 0.15625,
            "lightness": 1.99219,
            "rgb": [
                142,
                152,
                129
            ]
        },
        "metal": {
            "brightness": 14,
            "contrast": 1.25,
            "hue": 85,
            "saturation": 0.15625,
            "lightness": 1.99219,
            "rgb": [
                142,
                152,
                129
            ]
        }
    },
    "353": {
        "name": "Hint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.234375,
            "lightness": 1.36719,
            "rgb": [
                115,
                103,
                81
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.234375,
            "lightness": 1.36719,
            "rgb": [
                120,
                108,
                86
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.234375,
            "lightness": 1.36719,
            "rgb": [
                120,
                108,
                86
            ]
        }
    },
    "93": {
        "name": "Frost",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 14,
            "contrast": 1.25,
            "hue": 190,
            "saturation": 0.101563,
            "lightness": 1.875,
            "rgb": [
                124,
                136,
                138
            ]
        },
        "leather": {
            "brightness": 16,
            "contrast": 1.25,
            "hue": 180,
            "saturation": 0.101563,
            "lightness": 1.875,
            "rgb": [
                131,
                144,
                144
            ]
        },
        "metal": {
            "brightness": 16,
            "contrast": 1.25,
            "hue": 180,
            "saturation": 0.101563,
            "lightness": 1.875,
            "rgb": [
                131,
                144,
                144
            ]
        }
    },
    "446": {
        "name": "Whisper",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 22,
            "contrast": 1.25,
            "hue": 0,
            "saturation": 0.101563,
            "lightness": 1.36719,
            "rgb": [
                127,
                114,
                114
            ]
        },
        "leather": {
            "brightness": 25,
            "contrast": 1.25,
            "hue": 0,
            "saturation": 0.101563,
            "lightness": 1.36719,
            "rgb": [
                135,
                122,
                122
            ]
        },
        "metal": {
            "brightness": 25,
            "contrast": 1.25,
            "hue": 0,
            "saturation": 0.101563,
            "lightness": 1.36719,
            "rgb": [
                135,
                122,
                122
            ]
        }
    },
    "354": {
        "name": "Pink Tint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 6,
            "saturation": 0.351563,
            "lightness": 1.99219,
            "rgb": [
                163,
                121,
                115
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 6,
            "saturation": 0.46875,
            "lightness": 1.99219,
            "rgb": [
                173,
                117,
                110
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 6,
            "saturation": 0.351563,
            "lightness": 1.99219,
            "rgb": [
                163,
                121,
                115
            ]
        }
    },
    "447": {
        "name": "Peach Tint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 25,
            "saturation": 0.351563,
            "lightness": 1.99219,
            "rgb": [
                160,
                130,
                108
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 25,
            "saturation": 0.351563,
            "lightness": 1.99219,
            "rgb": [
                160,
                130,
                108
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 25,
            "saturation": 0.351563,
            "lightness": 1.99219,
            "rgb": [
                160,
                130,
                108
            ]
        }
    },
    "462": {
        "name": "Lemon Tint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.390625,
            "lightness": 1.99219,
            "rgb": [
                158,
                139,
                102
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.390625,
            "lightness": 1.99219,
            "rgb": [
                158,
                139,
                102
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 40,
            "saturation": 0.390625,
            "lightness": 1.99219,
            "rgb": [
                158,
                139,
                102
            ]
        }
    },
    "355": {
        "name": "Olive Tint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 60,
            "saturation": 0.234375,
            "lightness": 1.99219,
            "rgb": [
                143,
                143,
                113
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 60,
            "saturation": 0.234375,
            "lightness": 1.99219,
            "rgb": [
                143,
                143,
                113
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.25,
            "hue": 60,
            "saturation": 0.234375,
            "lightness": 1.99219,
            "rgb": [
                143,
                143,
                113
            ]
        }
    },
    "448": {
        "name": "Green Tint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 90,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                125,
                134,
                116
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 90,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                125,
                134,
                116
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 90,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                125,
                134,
                116
            ]
        }
    },
    "461": {
        "name": "Aqua Tint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 150,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                116,
                134,
                125
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 150,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                116,
                134,
                125
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 150,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                116,
                134,
                125
            ]
        }
    },
    "356": {
        "name": "Blue Tint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 190,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                115,
                128,
                131
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 190,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                115,
                128,
                131
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 190,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                115,
                128,
                131
            ]
        }
    },
    "449": {
        "name": "Violet Tint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 235,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                119,
                121,
                135
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 235,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                119,
                121,
                135
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 235,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                119,
                121,
                135
            ]
        }
    },
    "460": {
        "name": "Purple Tint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 290,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                128,
                115,
                131
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 290,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                128,
                115,
                131
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 290,
            "saturation": 0.117188,
            "lightness": 1.99219,
            "rgb": [
                128,
                115,
                131
            ]
        }
    },
    "357": {
        "name": "Rose Tint",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 350,
            "saturation": 0.195313,
            "lightness": 1.99219,
            "rgb": [
                141,
                114,
                119
            ]
        },
        "leather": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 350,
            "saturation": 0.195313,
            "lightness": 1.99219,
            "rgb": [
                141,
                114,
                119
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.25,
            "hue": 350,
            "saturation": 0.195313,
            "lightness": 1.99219,
            "rgb": [
                141,
                114,
                119
            ]
        }
    },
    "98": {
        "name": "Shy Violet",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -2,
            "contrast": 1,
            "hue": 320,
            "saturation": 0.101563,
            "lightness": 1.99219,
            "rgb": [
                116,
                105,
                112
            ]
        },
        "leather": {
            "brightness": -2,
            "contrast": 1,
            "hue": 320,
            "saturation": 0.101563,
            "lightness": 1.99219,
            "rgb": [
                116,
                105,
                112
            ]
        },
        "metal": {
            "brightness": -2,
            "contrast": 1,
            "hue": 320,
            "saturation": 0.125,
            "lightness": 1.99219,
            "rgb": [
                118,
                103,
                113
            ]
        }
    },
    "99": {
        "name": "Silt",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.09375,
            "hue": 130,
            "saturation": 0.0390625,
            "lightness": 1.44531,
            "rgb": [
                95,
                100,
                96
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.09375,
            "hue": 130,
            "saturation": 0.0390625,
            "lightness": 1.44531,
            "rgb": [
                95,
                100,
                96
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.09375,
            "hue": 130,
            "saturation": 0.0234375,
            "lightness": 1.44531,
            "rgb": [
                96,
                99,
                97
            ]
        }
    },
    "101": {
        "name": "Stone",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 56,
            "saturation": 0.125,
            "lightness": 1.25,
            "rgb": [
                102,
                100,
                85
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 56,
            "saturation": 0.125,
            "lightness": 1.25,
            "rgb": [
                102,
                100,
                85
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 56,
            "saturation": 0.125,
            "lightness": 1.25,
            "rgb": [
                102,
                100,
                85
            ]
        }
    },
    "103": {
        "name": "Truffle",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 5,
            "contrast": 1.05469,
            "hue": 28,
            "saturation": 0.195313,
            "lightness": 1.28906,
            "rgb": [
                97,
                84,
                73
            ]
        },
        "leather": {
            "brightness": 5,
            "contrast": 1.05469,
            "hue": 28,
            "saturation": 0.195313,
            "lightness": 1.28906,
            "rgb": [
                97,
                84,
                73
            ]
        },
        "metal": {
            "brightness": 5,
            "contrast": 1.05469,
            "hue": 28,
            "saturation": 0.195313,
            "lightness": 1.28906,
            "rgb": [
                97,
                84,
                73
            ]
        }
    },
    "450": {
        "name": "Mushroom",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -2,
            "contrast": 1.09375,
            "hue": 25,
            "saturation": 0.234375,
            "lightness": 1.21094,
            "rgb": [
                75,
                58,
                45
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1,
            "hue": 25,
            "saturation": 0.234375,
            "lightness": 1.21094,
            "rgb": [
                74,
                59,
                47
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1,
            "hue": 25,
            "saturation": 0.390625,
            "lightness": 1.21094,
            "rgb": [
                89,
                63,
                43
            ]
        }
    },
    "96": {
        "name": "Riverbed",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -2,
            "contrast": 1,
            "hue": 21,
            "saturation": 0.15625,
            "lightness": 1.17188,
            "rgb": [
                75,
                63,
                57
            ]
        },
        "leather": {
            "brightness": -2,
            "contrast": 1,
            "hue": 21,
            "saturation": 0.15625,
            "lightness": 1.17188,
            "rgb": [
                75,
                63,
                57
            ]
        },
        "metal": {
            "brightness": -2,
            "contrast": 1,
            "hue": 21,
            "saturation": 0.273438,
            "lightness": 1.17188,
            "rgb": [
                82,
                62,
                51
            ]
        }
    },
    "100": {
        "name": "Silver Lead",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1,
            "hue": 65,
            "saturation": 0.078125,
            "lightness": 1.25,
            "rgb": [
                69,
                70,
                62
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 65,
            "saturation": 0.078125,
            "lightness": 1.25,
            "rgb": [
                69,
                70,
                62
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1,
            "hue": 65,
            "saturation": 0.078125,
            "lightness": 1.25,
            "rgb": [
                69,
                70,
                62
            ]
        }
    },
    "92": {
        "name": "Dusk",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -2,
            "contrast": 1,
            "hue": 260,
            "saturation": 0.078125,
            "lightness": 1.17188,
            "rgb": [
                64,
                61,
                70
            ]
        },
        "leather": {
            "brightness": -2,
            "contrast": 1,
            "hue": 260,
            "saturation": 0.078125,
            "lightness": 1.17188,
            "rgb": [
                64,
                61,
                70
            ]
        },
        "metal": {
            "brightness": -2,
            "contrast": 1,
            "hue": 260,
            "saturation": 0.078125,
            "lightness": 1.17188,
            "rgb": [
                64,
                61,
                70
            ]
        }
    },
    "97": {
        "name": "Sage",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1,
            "hue": 130,
            "saturation": 0.078125,
            "lightness": 1.17188,
            "rgb": [
                55,
                63,
                56
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1,
            "hue": 130,
            "saturation": 0.078125,
            "lightness": 1.17188,
            "rgb": [
                55,
                63,
                56
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1,
            "hue": 130,
            "saturation": 0.078125,
            "lightness": 1.17188,
            "rgb": [
                55,
                63,
                56
            ]
        }
    },
    "89": {
        "name": "Chalkboard",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1,
            "hue": 200,
            "saturation": 0.125,
            "lightness": 1.17188,
            "rgb": [
                50,
                60,
                65
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1,
            "hue": 200,
            "saturation": 0.125,
            "lightness": 1.17188,
            "rgb": [
                50,
                60,
                65
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1,
            "hue": 200,
            "saturation": 0.125,
            "lightness": 1.17188,
            "rgb": [
                50,
                60,
                65
            ]
        }
    },
    "463": {
        "name": "Rose Shade",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 0,
            "saturation": 0.3125,
            "lightness": 1.21094,
            "rgb": [
                74,
                42,
                42
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 0,
            "saturation": 0.3125,
            "lightness": 1.21094,
            "rgb": [
                74,
                42,
                42
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 0,
            "saturation": 0.390625,
            "lightness": 1.21094,
            "rgb": [
                79,
                39,
                39
            ]
        }
    },
    "459": {
        "name": "Orange Shade",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1.05469,
            "hue": 25,
            "saturation": 0.3125,
            "lightness": 1.28906,
            "rgb": [
                79,
                57,
                41
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1.05469,
            "hue": 25,
            "saturation": 0.3125,
            "lightness": 1.28906,
            "rgb": [
                79,
                57,
                41
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1.05469,
            "hue": 25,
            "saturation": 0.429688,
            "lightness": 1.44531,
            "rgb": [
                94,
                64,
                41
            ]
        }
    },
    "472": {
        "name": "Lemon Shade",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1.05469,
            "hue": 36,
            "saturation": 0.390625,
            "lightness": 1.28906,
            "rgb": [
                74,
                54,
                26
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1.05469,
            "hue": 36,
            "saturation": 0.390625,
            "lightness": 1.28906,
            "rgb": [
                74,
                54,
                26
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1.05469,
            "hue": 36,
            "saturation": 0.390625,
            "lightness": 1.28906,
            "rgb": [
                74,
                54,
                26
            ]
        }
    },
    "485": {
        "name": "Olive Shade",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -12,
            "contrast": 1,
            "hue": 55,
            "saturation": 0.15625,
            "lightness": 1.28906,
            "rgb": [
                52,
                50,
                35
            ]
        },
        "leather": {
            "brightness": -12,
            "contrast": 1,
            "hue": 55,
            "saturation": 0.15625,
            "lightness": 1.28906,
            "rgb": [
                52,
                50,
                35
            ]
        },
        "metal": {
            "brightness": -12,
            "contrast": 1,
            "hue": 55,
            "saturation": 0.15625,
            "lightness": 1.28906,
            "rgb": [
                52,
                50,
                35
            ]
        }
    },
    "484": {
        "name": "Green Shade",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1,
            "hue": 100,
            "saturation": 0.117188,
            "lightness": 1.28906,
            "rgb": [
                50,
                59,
                45
            ]
        },
        "leather": {
            "brightness": -10,
            "contrast": 1,
            "hue": 100,
            "saturation": 0.117188,
            "lightness": 1.28906,
            "rgb": [
                50,
                59,
                45
            ]
        },
        "metal": {
            "brightness": -10,
            "contrast": 1,
            "hue": 100,
            "saturation": 0.117188,
            "lightness": 1.28906,
            "rgb": [
                50,
                59,
                45
            ]
        }
    },
    "358": {
        "name": "Tea Shade",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1,
            "hue": 150,
            "saturation": 0.0625,
            "lightness": 1.17188,
            "rgb": [
                43,
                50,
                46
            ]
        },
        "leather": {
            "brightness": -10,
            "contrast": 1,
            "hue": 150,
            "saturation": 0.0625,
            "lightness": 1.17188,
            "rgb": [
                43,
                50,
                46
            ]
        },
        "metal": {
            "brightness": -10,
            "contrast": 1,
            "hue": 150,
            "saturation": 0.0625,
            "lightness": 1.17188,
            "rgb": [
                43,
                50,
                46
            ]
        }
    },
    "451": {
        "name": "Blue Shade",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 200,
            "saturation": 0.117188,
            "lightness": 1.17188,
            "rgb": [
                44,
                52,
                57
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 200,
            "saturation": 0.117188,
            "lightness": 1.17188,
            "rgb": [
                44,
                52,
                57
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 200,
            "saturation": 0.117188,
            "lightness": 1.17188,
            "rgb": [
                44,
                52,
                57
            ]
        }
    },
    "458": {
        "name": "Night Shade",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1,
            "hue": 230,
            "saturation": 0.117188,
            "lightness": 1.17188,
            "rgb": [
                41,
                44,
                54
            ]
        },
        "leather": {
            "brightness": -10,
            "contrast": 1,
            "hue": 230,
            "saturation": 0.117188,
            "lightness": 1.17188,
            "rgb": [
                41,
                44,
                54
            ]
        },
        "metal": {
            "brightness": -10,
            "contrast": 1,
            "hue": 230,
            "saturation": 0.117188,
            "lightness": 1.17188,
            "rgb": [
                41,
                44,
                54
            ]
        }
    },
    "464": {
        "name": "Grape Shade",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 280,
            "saturation": 0.101563,
            "lightness": 1.17188,
            "rgb": [
                52,
                45,
                56
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 280,
            "saturation": 0.101563,
            "lightness": 1.17188,
            "rgb": [
                52,
                45,
                56
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 280,
            "saturation": 0.101563,
            "lightness": 1.17188,
            "rgb": [
                52,
                45,
                56
            ]
        }
    },
    "471": {
        "name": "Wine Shade",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 340,
            "saturation": 0.15625,
            "lightness": 1.17188,
            "rgb": [
                61,
                43,
                49
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 340,
            "saturation": 0.15625,
            "lightness": 1.17188,
            "rgb": [
                61,
                43,
                49
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1,
            "hue": 340,
            "saturation": 0.15625,
            "lightness": 1.17188,
            "rgb": [
                61,
                43,
                49
            ]
        }
    },
    "83": {
        "name": "Midnight Red",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 8,
            "saturation": 0.234375,
            "lightness": 0.898438,
            "rgb": [
                37,
                15,
                11
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 8,
            "saturation": 0.234375,
            "lightness": 0.898438,
            "rgb": [
                37,
                15,
                11
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 8,
            "saturation": 0.234375,
            "lightness": 0.976563,
            "rgb": [
                48,
                27,
                23
            ]
        }
    },
    "85": {
        "name": "Midnight Rust",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 20,
            "saturation": 0.234375,
            "lightness": 0.898438,
            "rgb": [
                36,
                18,
                9
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 20,
            "saturation": 0.234375,
            "lightness": 0.898438,
            "rgb": [
                36,
                18,
                9
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 20,
            "saturation": 0.3125,
            "lightness": 0.976563,
            "rgb": [
                53,
                29,
                16
            ]
        }
    },
    "79": {
        "name": "Midnight Gold",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 35,
            "saturation": 0.3125,
            "lightness": 0.898438,
            "rgb": [
                38,
                23,
                2
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 35,
            "saturation": 0.3125,
            "lightness": 0.898438,
            "rgb": [
                38,
                23,
                2
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 35,
            "saturation": 0.3125,
            "lightness": 0.976563,
            "rgb": [
                50,
                35,
                13
            ]
        }
    },
    "81": {
        "name": "Midnight Olive",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 45,
            "saturation": 0.234375,
            "lightness": 0.898438,
            "rgb": [
                32,
                25,
                6
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 45,
            "saturation": 0.234375,
            "lightness": 0.898438,
            "rgb": [
                32,
                25,
                6
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 45,
            "saturation": 0.234375,
            "lightness": 0.976563,
            "rgb": [
                44,
                37,
                17
            ]
        }
    },
    "88": {
        "name": "Midnight Yew",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 85,
            "saturation": 0.117188,
            "lightness": 0.898438,
            "rgb": [
                22,
                28,
                14
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 85,
            "saturation": 0.117188,
            "lightness": 0.898438,
            "rgb": [
                22,
                28,
                14
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 85,
            "saturation": 0.117188,
            "lightness": 0.976563,
            "rgb": [
                33,
                39,
                25
            ]
        }
    },
    "80": {
        "name": "Midnight Green",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 145,
            "saturation": 0.117188,
            "lightness": 0.898438,
            "rgb": [
                15,
                28,
                20
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 145,
            "saturation": 0.117188,
            "lightness": 0.898438,
            "rgb": [
                15,
                28,
                20
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 145,
            "saturation": 0.117188,
            "lightness": 0.976563,
            "rgb": [
                26,
                40,
                32
            ]
        }
    },
    "86": {
        "name": "Midnight Teal",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 175,
            "saturation": 0.15625,
            "lightness": 0.898438,
            "rgb": [
                10,
                27,
                26
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 175,
            "saturation": 0.15625,
            "lightness": 0.898438,
            "rgb": [
                10,
                27,
                26
            ]
        },
        "metal": {
            "brightness": -15,
            "contrast": 1,
            "hue": 175,
            "saturation": 0.15625,
            "lightness": 0.976563,
            "rgb": [
                18,
                35,
                33
            ]
        }
    },
    "76": {
        "name": "Midnight Blue",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -15,
            "contrast": 1,
            "hue": 205,
            "saturation": 0.195313,
            "lightness": 0.898438,
            "rgb": [
                14,
                28,
                37
            ]
        },
        "leather": {
            "brightness": -15,
            "contrast": 1,
            "hue": 205,
            "saturation": 0.195313,
            "lightness": 0.898438,
            "rgb": [
                14,
                28,
                37
            ]
        },
        "metal": {
            "brightness": -15,
            "contrast": 1,
            "hue": 205,
            "saturation": 0.195313,
            "lightness": 0.976563,
            "rgb": [
                17,
                30,
                40
            ]
        }
    },
    "77": {
        "name": "Midnight Sky",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 225,
            "saturation": 0.15625,
            "lightness": 0.898438,
            "rgb": [
                23,
                27,
                40
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 225,
            "saturation": 0.15625,
            "lightness": 0.898438,
            "rgb": [
                23,
                27,
                40
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 225,
            "saturation": 0.15625,
            "lightness": 0.976563,
            "rgb": [
                25,
                30,
                43
            ]
        }
    },
    "87": {
        "name": "Midnight Violet",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 245,
            "saturation": 0.15625,
            "lightness": 0.898438,
            "rgb": [
                26,
                24,
                41
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 245,
            "saturation": 0.15625,
            "lightness": 0.898438,
            "rgb": [
                26,
                24,
                41
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 245,
            "saturation": 0.15625,
            "lightness": 0.976563,
            "rgb": [
                28,
                27,
                43
            ]
        }
    },
    "82": {
        "name": "Midnight Purple",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 270,
            "saturation": 0.117188,
            "lightness": 0.898438,
            "rgb": [
                30,
                23,
                37
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 270,
            "saturation": 0.117188,
            "lightness": 0.898438,
            "rgb": [
                30,
                23,
                37
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 270,
            "saturation": 0.117188,
            "lightness": 0.976563,
            "rgb": [
                33,
                26,
                40
            ]
        }
    },
    "78": {
        "name": "Midnight Fuchsia",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 315,
            "saturation": 0.117188,
            "lightness": 0.898438,
            "rgb": [
                36,
                22,
                32
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 315,
            "saturation": 0.117188,
            "lightness": 0.898438,
            "rgb": [
                36,
                22,
                32
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 315,
            "saturation": 0.117188,
            "lightness": 0.976563,
            "rgb": [
                38,
                25,
                35
            ]
        }
    },
    "84": {
        "name": "Midnight Rose",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 355,
            "saturation": 0.195313,
            "lightness": 0.898438,
            "rgb": [
                43,
                22,
                24
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 355,
            "saturation": 0.195313,
            "lightness": 0.898438,
            "rgb": [
                43,
                22,
                24
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 355,
            "saturation": 0.195313,
            "lightness": 0.976563,
            "rgb": [
                46,
                25,
                27
            ]
        }
    },
    "482": {
        "name": "Midnight Fire",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -38,
            "contrast": 1,
            "hue": 25,
            "saturation": 0.273438,
            "lightness": 1.01563,
            "rgb": [
                0,
                0,
                0
            ]
        },
        "leather": {
            "brightness": -23,
            "contrast": 1,
            "hue": 25,
            "saturation": 0.195313,
            "lightness": 1.01563,
            "rgb": [
                26,
                13,
                3
            ]
        },
        "metal": {
            "brightness": -23,
            "contrast": 1,
            "hue": 25,
            "saturation": 0.273438,
            "lightness": 1.01563,
            "rgb": [
                31,
                12,
                0
            ]
        }
    },
    "483": {
        "name": "Midnight Ice",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -38,
            "contrast": 1,
            "hue": 195,
            "saturation": 0.507813,
            "lightness": 1.01563,
            "rgb": [
                0,
                0,
                8
            ]
        },
        "leather": {
            "brightness": -20,
            "contrast": 1,
            "hue": 195,
            "saturation": 0.078125,
            "lightness": 1.01563,
            "rgb": [
                15,
                21,
                24
            ]
        },
        "metal": {
            "brightness": -23,
            "contrast": 1,
            "hue": 195,
            "saturation": 0.195313,
            "lightness": 1.01563,
            "rgb": [
                1,
                17,
                23
            ]
        }
    },
    "6": {
        "name": "Celestial",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 52,
            "contrast": 1.44531,
            "hue": 10,
            "saturation": 0.0234375,
            "lightness": 1.5625,
            "rgb": [
                211,
                208,
                207
            ]
        },
        "leather": {
            "brightness": 52,
            "contrast": 1.44531,
            "hue": 10,
            "saturation": 0.0234375,
            "lightness": 1.5625,
            "rgb": [
                211,
                208,
                207
            ]
        },
        "metal": {
            "brightness": 52,
            "contrast": 1.91406,
            "hue": 10,
            "saturation": 0.0234375,
            "lightness": 1.91406,
            "rgb": [
                197,
                193,
                192
            ]
        }
    },
    "443": {
        "name": "White",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 45,
            "contrast": 1.44531,
            "hue": 10,
            "saturation": 0.0234375,
            "lightness": 1.5625,
            "rgb": [
                189,
                186,
                185
            ]
        },
        "leather": {
            "brightness": 47,
            "contrast": 1.44531,
            "hue": 10,
            "saturation": 0.0234375,
            "lightness": 1.5625,
            "rgb": [
                195,
                192,
                191
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.91406,
            "hue": 10,
            "saturation": 0.0234375,
            "lightness": 1.83594,
            "rgb": [
                171,
                167,
                166
            ]
        }
    },
    "477": {
        "name": "Icing",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 39,
            "contrast": 1.44531,
            "hue": 10,
            "saturation": 0.0234375,
            "lightness": 1.44531,
            "rgb": [
                157,
                154,
                154
            ]
        },
        "leather": {
            "brightness": 39,
            "contrast": 1.44531,
            "hue": 10,
            "saturation": 0.0234375,
            "lightness": 1.44531,
            "rgb": [
                157,
                154,
                154
            ]
        },
        "metal": {
            "brightness": 40,
            "contrast": 1.83594,
            "hue": 10,
            "saturation": 0.0234375,
            "lightness": 1.67969,
            "rgb": [
                142,
                138,
                137
            ]
        }
    },
    "611": {
        "name": "Fog",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.32813,
            "hue": 15,
            "saturation": 0.0390625,
            "lightness": 1.36719,
            "rgb": [
                142,
                138,
                136
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.32813,
            "hue": 15,
            "saturation": 0.0390625,
            "lightness": 1.36719,
            "rgb": [
                142,
                138,
                136
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.67969,
            "hue": 15,
            "saturation": 0.0390625,
            "lightness": 1.64063,
            "rgb": [
                131,
                126,
                124
            ]
        }
    },
    "610": {
        "name": "Fluff",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 25,
            "contrast": 1.28906,
            "hue": 5,
            "saturation": 0.0234375,
            "lightness": 1.36719,
            "rgb": [
                125,
                122,
                122
            ]
        },
        "leather": {
            "brightness": 25,
            "contrast": 1.28906,
            "hue": 5,
            "saturation": 0.0234375,
            "lightness": 1.36719,
            "rgb": [
                125,
                122,
                122
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.52344,
            "hue": 15,
            "saturation": 0.0234375,
            "lightness": 1.5625,
            "rgb": [
                109,
                106,
                105
            ]
        }
    },
    "475": {
        "name": "Dust",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.17188,
            "hue": 5,
            "saturation": 0.0234375,
            "lightness": 1.28906,
            "rgb": [
                107,
                105,
                105
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.17188,
            "hue": 5,
            "saturation": 0.0234375,
            "lightness": 1.28906,
            "rgb": [
                107,
                105,
                105
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.44531,
            "hue": 5,
            "saturation": 0.0234375,
            "lightness": 1.44531,
            "rgb": [
                94,
                91,
                90
            ]
        }
    },
    "3": {
        "name": "Chalk",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 5,
            "saturation": 0.0234375,
            "lightness": 1.25,
            "rgb": [
                95,
                92,
                92
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.13281,
            "hue": 5,
            "saturation": 0.0234375,
            "lightness": 1.25,
            "rgb": [
                95,
                92,
                92
            ]
        },
        "metal": {
            "brightness": 10,
            "contrast": 1.28906,
            "hue": 5,
            "saturation": 0.0234375,
            "lightness": 1.36719,
            "rgb": [
                84,
                81,
                81
            ]
        }
    },
    "474": {
        "name": "Ash",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.07813,
            "hue": 5,
            "saturation": 0.0234375,
            "lightness": 1.17188,
            "rgb": [
                82,
                79,
                79
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.07813,
            "hue": 5,
            "saturation": 0.0234375,
            "lightness": 1.17188,
            "rgb": [
                82,
                79,
                79
            ]
        },
        "metal": {
            "brightness": 8,
            "contrast": 1.28906,
            "hue": 5,
            "saturation": 0.0234375,
            "lightness": 1.28906,
            "rgb": [
                74,
                71,
                71
            ]
        }
    },
    "4": {
        "name": "Gray",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 3,
            "contrast": 1.05469,
            "hue": 340,
            "saturation": 0.0234375,
            "lightness": 1.13281,
            "rgb": [
                72,
                69,
                70
            ]
        },
        "leather": {
            "brightness": 3,
            "contrast": 1.05469,
            "hue": 340,
            "saturation": 0.0234375,
            "lightness": 1.13281,
            "rgb": [
                72,
                69,
                70
            ]
        },
        "metal": {
            "brightness": 5,
            "contrast": 1.28906,
            "hue": 340,
            "saturation": 0.0234375,
            "lightness": 1.28906,
            "rgb": [
                66,
                63,
                64
            ]
        }
    },
    "476": {
        "name": "Graphite",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1,
            "hue": 275,
            "saturation": 0.0234375,
            "lightness": 1.09375,
            "rgb": [
                59,
                57,
                60
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 275,
            "saturation": 0.0234375,
            "lightness": 1.09375,
            "rgb": [
                59,
                57,
                60
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.21094,
            "hue": 275,
            "saturation": 0.0234375,
            "lightness": 1.28906,
            "rgb": [
                51,
                49,
                52
            ]
        }
    },
    "5": {
        "name": "Pitch",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 275,
            "saturation": 0.0234375,
            "lightness": 1.09375,
            "rgb": [
                48,
                46,
                49
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 275,
            "saturation": 0.0234375,
            "lightness": 1.09375,
            "rgb": [
                48,
                46,
                49
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1.09375,
            "hue": 275,
            "saturation": 0.0234375,
            "lightness": 1.17188,
            "rgb": [
                44,
                42,
                45
            ]
        }
    },
    "2": {
        "name": "Black",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 275,
            "saturation": 0.0234375,
            "lightness": 1.09375,
            "rgb": [
                37,
                35,
                38
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 275,
            "saturation": 0.0234375,
            "lightness": 1.09375,
            "rgb": [
                37,
                35,
                38
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 275,
            "saturation": 0.0234375,
            "lightness": 1.09375,
            "rgb": [
                37,
                35,
                38
            ]
        }
    },
    "473": {
        "name": "Abyss",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 275,
            "saturation": 0.0234375,
            "lightness": 1.09375,
            "rgb": [
                26,
                24,
                27
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 275,
            "saturation": 0.0234375,
            "lightness": 1.09375,
            "rgb": [
                26,
                24,
                27
            ]
        },
        "metal": {
            "brightness": -23,
            "contrast": 1,
            "hue": 275,
            "saturation": 0,
            "lightness": 1.09375,
            "rgb": [
                15,
                15,
                15
            ]
        }
    },
    "1152": {
        "name": "Heirloom",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -33,
            "contrast": 1,
            "hue": 36,
            "saturation": 0.976563,
            "lightness": 1.40625,
            "rgb": [
                45,
                0,
                0
            ]
        },
        "leather": {
            "brightness": -33,
            "contrast": 1,
            "hue": 36,
            "saturation": 0.976563,
            "lightness": 1.40625,
            "rgb": [
                45,
                0,
                0
            ]
        },
        "metal": {
            "brightness": -33,
            "contrast": 1,
            "hue": 36,
            "saturation": 0.976563,
            "lightness": 1.40625,
            "rgb": [
                45,
                0,
                0
            ]
        }
    },
    "71": {
        "name": "Oxblood",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -23,
            "contrast": 1,
            "hue": 13,
            "saturation": 0.585938,
            "lightness": 1.17188,
            "rgb": [
                55,
                4,
                0
            ]
        },
        "leather": {
            "brightness": -20,
            "contrast": 1,
            "hue": 13,
            "saturation": 0.507813,
            "lightness": 1.17188,
            "rgb": [
                57,
                13,
                0
            ]
        },
        "metal": {
            "brightness": -23,
            "contrast": 1.17188,
            "hue": 20,
            "saturation": 0.703125,
            "lightness": 1.21094,
            "rgb": [
                55,
                0,
                0
            ]
        }
    },
    "1150": {
        "name": "Wrath",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -28,
            "contrast": 1.01563,
            "hue": 8,
            "saturation": 0.9375,
            "lightness": 1.40625,
            "rgb": [
                68,
                0,
                0
            ]
        },
        "leather": {
            "brightness": -28,
            "contrast": 1.01563,
            "hue": 8,
            "saturation": 0.9375,
            "lightness": 1.40625,
            "rgb": [
                68,
                0,
                0
            ]
        },
        "metal": {
            "brightness": -28,
            "contrast": 1.01563,
            "hue": 8,
            "saturation": 0.9375,
            "lightness": 1.40625,
            "rgb": [
                68,
                0,
                0
            ]
        }
    },
    "1153": {
        "name": "Blood",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -22,
            "contrast": 1.01563,
            "hue": 5,
            "saturation": 0.9375,
            "lightness": 1.40625,
            "rgb": [
                85,
                0,
                0
            ]
        },
        "leather": {
            "brightness": -22,
            "contrast": 1.01563,
            "hue": 5,
            "saturation": 0.9375,
            "lightness": 1.40625,
            "rgb": [
                85,
                0,
                0
            ]
        },
        "metal": {
            "brightness": -22,
            "contrast": 1.01563,
            "hue": 5,
            "saturation": 0.9375,
            "lightness": 1.40625,
            "rgb": [
                85,
                0,
                0
            ]
        }
    },
    "73": {
        "name": "Rust",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -15,
            "contrast": 1,
            "hue": 18,
            "saturation": 0.585938,
            "lightness": 1.17188,
            "rgb": [
                73,
                26,
                5
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 18,
            "saturation": 0.507813,
            "lightness": 1.17188,
            "rgb": [
                72,
                32,
                14
            ]
        },
        "metal": {
            "brightness": -15,
            "contrast": 1.17188,
            "hue": 26,
            "saturation": 0.703125,
            "lightness": 1.28906,
            "rgb": [
                73,
                19,
                0
            ]
        }
    },
    "1151": {
        "name": "Spitfire",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1,
            "hue": 18,
            "saturation": 0.976563,
            "lightness": 1.40625,
            "rgb": [
                96,
                19,
                0
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1,
            "hue": 18,
            "saturation": 0.976563,
            "lightness": 1.40625,
            "rgb": [
                96,
                19,
                0
            ]
        },
        "metal": {
            "brightness": -18,
            "contrast": 1,
            "hue": 18,
            "saturation": 0.976563,
            "lightness": 1.40625,
            "rgb": [
                96,
                19,
                0
            ]
        }
    },
    "1149": {
        "name": "Lava",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1.09375,
            "hue": 8,
            "saturation": 0.9375,
            "lightness": 1.40625,
            "rgb": [
                121,
                26,
                9
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1.09375,
            "hue": 8,
            "saturation": 0.9375,
            "lightness": 1.40625,
            "rgb": [
                121,
                26,
                9
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1.09375,
            "hue": 8,
            "saturation": 0.9375,
            "lightness": 1.40625,
            "rgb": [
                121,
                26,
                9
            ]
        }
    },
    "66": {
        "name": "Copper",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1,
            "hue": 23,
            "saturation": 0.664063,
            "lightness": 1.28906,
            "rgb": [
                93,
                46,
                15
            ]
        },
        "leather": {
            "brightness": -10,
            "contrast": 1,
            "hue": 23,
            "saturation": 0.625,
            "lightness": 1.28906,
            "rgb": [
                90,
                46,
                17
            ]
        },
        "metal": {
            "brightness": -2,
            "contrast": 1.17188,
            "hue": 20,
            "saturation": 0.742188,
            "lightness": 1.5625,
            "rgb": [
                124,
                58,
                23
            ]
        }
    },
    "466": {
        "name": "Old Penny",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 2,
            "contrast": 1.09375,
            "hue": 15,
            "saturation": 0.507813,
            "lightness": 1.25,
            "rgb": [
                108,
                62,
                45
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1.09375,
            "hue": 15,
            "saturation": 0.507813,
            "lightness": 1.25,
            "rgb": [
                108,
                62,
                45
            ]
        },
        "metal": {
            "brightness": 5,
            "contrast": 1.21094,
            "hue": 16,
            "saturation": 0.546875,
            "lightness": 1.28906,
            "rgb": [
                115,
                60,
                39
            ]
        }
    },
    "468": {
        "name": "Copper Pot",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 5,
            "contrast": 1.09375,
            "hue": 15,
            "saturation": 0.585938,
            "lightness": 1.48438,
            "rgb": [
                136,
                83,
                63
            ]
        },
        "leather": {
            "brightness": 5,
            "contrast": 1.09375,
            "hue": 15,
            "saturation": 0.546875,
            "lightness": 1.48438,
            "rgb": [
                133,
                83,
                65
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 15,
            "saturation": 0.703125,
            "lightness": 1.48438,
            "rgb": [
                135,
                55,
                26
            ]
        }
    },
    "481": {
        "name": "Copper Penny",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.21094,
            "hue": 18,
            "saturation": 0.546875,
            "lightness": 1.99219,
            "rgb": [
                161,
                109,
                85
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.21094,
            "hue": 18,
            "saturation": 0.546875,
            "lightness": 1.99219,
            "rgb": [
                161,
                109,
                85
            ]
        },
        "metal": {
            "brightness": 4,
            "contrast": 1.21094,
            "hue": 18,
            "saturation": 0.78125,
            "lightness": 1.99219,
            "rgb": [
                168,
                93,
                59
            ]
        }
    },
    "70": {
        "name": "Mithril",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.09375,
            "hue": 26,
            "saturation": 0.195313,
            "lightness": 1.99219,
            "rgb": [
                167,
                153,
                142
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.09375,
            "hue": 26,
            "saturation": 0.195313,
            "lightness": 1.99219,
            "rgb": [
                167,
                153,
                142
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.64063,
            "hue": 26,
            "saturation": 0.234375,
            "lightness": 1.99219,
            "rgb": [
                183,
                158,
                138
            ]
        }
    },
    "315": {
        "name": "White Gold",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 42,
            "saturation": 0.351563,
            "lightness": 1.99219,
            "rgb": [
                175,
                159,
                124
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.25,
            "hue": 42,
            "saturation": 0.351563,
            "lightness": 1.99219,
            "rgb": [
                175,
                159,
                124
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.44531,
            "hue": 42,
            "saturation": 0.390625,
            "lightness": 1.99219,
            "rgb": [
                175,
                154,
                110
            ]
        }
    },
    "480": {
        "name": "Antique Gold",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 5,
            "contrast": 1.13281,
            "hue": 37,
            "saturation": 0.5625,
            "lightness": 1.99219,
            "rgb": [
                156,
                126,
                81
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1.05469,
            "hue": 37,
            "saturation": 0.546875,
            "lightness": 1.99219,
            "rgb": [
                151,
                124,
                83
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.32813,
            "hue": 37,
            "saturation": 0.625,
            "lightness": 1.99219,
            "rgb": [
                187,
                149,
                90
            ]
        }
    },
    "1155": {
        "name": "Illumination",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 22,
            "contrast": 1.5625,
            "hue": 37,
            "saturation": 0.78125,
            "lightness": 1.99219,
            "rgb": [
                197,
                141,
                54
            ]
        },
        "leather": {
            "brightness": 22,
            "contrast": 1.5625,
            "hue": 37,
            "saturation": 0.78125,
            "lightness": 1.99219,
            "rgb": [
                197,
                141,
                54
            ]
        },
        "metal": {
            "brightness": 27,
            "contrast": 1.5625,
            "hue": 37,
            "saturation": 0.78125,
            "lightness": 1.99219,
            "rgb": [
                217,
                161,
                74
            ]
        }
    },
    "67": {
        "name": "Gold",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -1,
            "contrast": 1.13281,
            "hue": 37,
            "saturation": 0.664063,
            "lightness": 1.99219,
            "rgb": [
                138,
                103,
                50
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1,
            "hue": 37,
            "saturation": 0.703125,
            "lightness": 1.99219,
            "rgb": [
                137,
                105,
                55
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.36719,
            "hue": 37,
            "saturation": 0.859375,
            "lightness": 1.99219,
            "rgb": [
                181,
                127,
                44
            ]
        }
    },
    "1154": {
        "name": "Redemption",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -1,
            "contrast": 1.17188,
            "hue": 37,
            "saturation": 1.09375,
            "lightness": 1.99219,
            "rgb": [
                161,
                102,
                12
            ]
        },
        "leather": {
            "brightness": -1,
            "contrast": 1.17188,
            "hue": 37,
            "saturation": 1.09375,
            "lightness": 1.99219,
            "rgb": [
                161,
                102,
                12
            ]
        },
        "metal": {
            "brightness": -1,
            "contrast": 1.17188,
            "hue": 37,
            "saturation": 1.09375,
            "lightness": 1.99219,
            "rgb": [
                161,
                102,
                12
            ]
        }
    },
    "64": {
        "name": "Brass",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 2,
            "contrast": 1.11719,
            "hue": 36,
            "saturation": 0.742188,
            "lightness": 1.21094,
            "rgb": [
                113,
                73,
                16
            ]
        },
        "leather": {
            "brightness": -2,
            "contrast": 1,
            "hue": 36,
            "saturation": 0.742188,
            "lightness": 1.21094,
            "rgb": [
                108,
                73,
                21
            ]
        },
        "metal": {
            "brightness": 8,
            "contrast": 1.40625,
            "hue": 36,
            "saturation": 0.78125,
            "lightness": 1.40625,
            "rgb": [
                128,
                75,
                0
            ]
        }
    },
    "65": {
        "name": "Bronze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 50,
            "saturation": 0.273438,
            "lightness": 1.17188,
            "rgb": [
                63,
                57,
                33
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 50,
            "saturation": 0.273438,
            "lightness": 1.17188,
            "rgb": [
                63,
                57,
                33
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.40625,
            "hue": 50,
            "saturation": 0.507813,
            "lightness": 1.5625,
            "rgb": [
                72,
                57,
                0
            ]
        }
    },
    "62": {
        "name": "Antique Bronze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1,
            "hue": 36,
            "saturation": 0.195313,
            "lightness": 1.17188,
            "rgb": [
                69,
                59,
                46
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1,
            "hue": 36,
            "saturation": 0.195313,
            "lightness": 1.17188,
            "rgb": [
                69,
                59,
                46
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.40625,
            "hue": 42,
            "saturation": 0.3125,
            "lightness": 1.5625,
            "rgb": [
                63,
                47,
                12
            ]
        }
    },
    "63": {
        "name": "Antique Olive",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1,
            "hue": 70,
            "saturation": 0.15625,
            "lightness": 1.17188,
            "rgb": [
                62,
                65,
                48
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1,
            "hue": 70,
            "saturation": 0.15625,
            "lightness": 1.17188,
            "rgb": [
                62,
                65,
                48
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1.09375,
            "hue": 70,
            "saturation": 0.234375,
            "lightness": 1.36719,
            "rgb": [
                65,
                70,
                42
            ]
        }
    },
    "1156": {
        "name": "Spite",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 2,
            "contrast": 1.28906,
            "hue": 90,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                69,
                81,
                57
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1.28906,
            "hue": 90,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                69,
                81,
                57
            ]
        },
        "metal": {
            "brightness": 2,
            "contrast": 1.28906,
            "hue": 90,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                69,
                81,
                57
            ]
        }
    },
    "72": {
        "name": "Pewter",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -2,
            "contrast": 1,
            "hue": 60,
            "saturation": 0.15625,
            "lightness": 1.17188,
            "rgb": [
                70,
                70,
                54
            ]
        },
        "leather": {
            "brightness": -2,
            "contrast": 1,
            "hue": 60,
            "saturation": 0.15625,
            "lightness": 1.17188,
            "rgb": [
                70,
                70,
                54
            ]
        },
        "metal": {
            "brightness": 0,
            "contrast": 1.17188,
            "hue": 50,
            "saturation": 0.195313,
            "lightness": 1.36719,
            "rgb": [
                76,
                71,
                50
            ]
        }
    },
    "74": {
        "name": "Silver",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 8,
            "contrast": 1.09375,
            "hue": 210,
            "saturation": 0.125,
            "lightness": 1.99219,
            "rgb": [
                130,
                138,
                146
            ]
        },
        "leather": {
            "brightness": 8,
            "contrast": 1.09375,
            "hue": 210,
            "saturation": 0.125,
            "lightness": 1.99219,
            "rgb": [
                130,
                138,
                146
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.44531,
            "hue": 210,
            "saturation": 0.125,
            "lightness": 1.99219,
            "rgb": [
                136,
                146,
                157
            ]
        }
    },
    "385": {
        "name": "Burnished Steel",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1,
            "hue": 210,
            "saturation": 0.0625,
            "lightness": 1.28906,
            "rgb": [
                91,
                95,
                99
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1,
            "hue": 210,
            "saturation": 0.0625,
            "lightness": 1.28906,
            "rgb": [
                91,
                95,
                99
            ]
        },
        "metal": {
            "brightness": 5,
            "contrast": 1.25,
            "hue": 210,
            "saturation": 0.0625,
            "lightness": 1.5625,
            "rgb": [
                78,
                82,
                87
            ]
        }
    },
    "75": {
        "name": "Steel",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 2,
            "contrast": 1,
            "hue": 38,
            "saturation": 0.101563,
            "lightness": 1.28906,
            "rgb": [
                87,
                83,
                76
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1,
            "hue": 38,
            "saturation": 0.101563,
            "lightness": 1.28906,
            "rgb": [
                87,
                83,
                76
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 38,
            "saturation": 0.101563,
            "lightness": 1.48438,
            "rgb": [
                80,
                74,
                64
            ]
        }
    },
    "454": {
        "name": "Tarnished Steel",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -4,
            "contrast": 1.05469,
            "hue": 38,
            "saturation": 0.15625,
            "lightness": 1.28906,
            "rgb": [
                71,
                63,
                51
            ]
        },
        "leather": {
            "brightness": -6,
            "contrast": 1,
            "hue": 38,
            "saturation": 0.15625,
            "lightness": 1.28906,
            "rgb": [
                70,
                63,
                52
            ]
        },
        "metal": {
            "brightness": 0,
            "contrast": 1.17188,
            "hue": 38,
            "saturation": 0.195313,
            "lightness": 1.40625,
            "rgb": [
                80,
                70,
                53
            ]
        }
    },
    "455": {
        "name": "Oil Slick",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -15,
            "contrast": 1,
            "hue": 38,
            "saturation": 0.15625,
            "lightness": 1.28906,
            "rgb": [
                47,
                40,
                28
            ]
        },
        "leather": {
            "brightness": -15,
            "contrast": 1,
            "hue": 38,
            "saturation": 0.15625,
            "lightness": 1.28906,
            "rgb": [
                47,
                40,
                28
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1,
            "hue": 38,
            "saturation": 0.234375,
            "lightness": 1.32813,
            "rgb": [
                57,
                47,
                30
            ]
        }
    },
    "467": {
        "name": "Mudmetal",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 2,
            "contrast": 1,
            "hue": 38,
            "saturation": 0.429688,
            "lightness": 1.28906,
            "rgb": [
                105,
                86,
                55
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1,
            "hue": 38,
            "saturation": 0.429688,
            "lightness": 1.28906,
            "rgb": [
                105,
                86,
                55
            ]
        },
        "metal": {
            "brightness": 4,
            "contrast": 1.13281,
            "hue": 38,
            "saturation": 0.429688,
            "lightness": 1.44531,
            "rgb": [
                111,
                89,
                54
            ]
        }
    },
    "469": {
        "name": "Swamp Grass",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1,
            "hue": 43,
            "saturation": 0.390625,
            "lightness": 1.21094,
            "rgb": [
                72,
                59,
                27
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 43,
            "saturation": 0.390625,
            "lightness": 1.21094,
            "rgb": [
                72,
                59,
                27
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1.09375,
            "hue": 40,
            "saturation": 0.46875,
            "lightness": 1.28906,
            "rgb": [
                82,
                62,
                23
            ]
        }
    },
    "68": {
        "name": "Gunmetal",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1,
            "hue": 200,
            "saturation": 0.078125,
            "lightness": 1.25,
            "rgb": [
                62,
                68,
                71
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 200,
            "saturation": 0.078125,
            "lightness": 1.25,
            "rgb": [
                62,
                68,
                71
            ]
        },
        "metal": {
            "brightness": -5,
            "contrast": 1,
            "hue": 200,
            "saturation": 0.078125,
            "lightness": 1.28906,
            "rgb": [
                59,
                65,
                68
            ]
        }
    },
    "69": {
        "name": "Iron",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -13,
            "contrast": 1,
            "hue": 200,
            "saturation": 0.101563,
            "lightness": 1.17188,
            "rgb": [
                33,
                41,
                45
            ]
        },
        "leather": {
            "brightness": -13,
            "contrast": 1,
            "hue": 200,
            "saturation": 0.101563,
            "lightness": 1.17188,
            "rgb": [
                33,
                41,
                45
            ]
        },
        "metal": {
            "brightness": -12,
            "contrast": 1,
            "hue": 200,
            "saturation": 0.101563,
            "lightness": 1.17188,
            "rgb": [
                35,
                43,
                47
            ]
        }
    },
    "584": {
        "name": "Ancient Silver",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 42,
            "contrast": 1.5625,
            "hue": 42,
            "saturation": 0.273438,
            "lightness": 1.28906,
            "rgb": [
                157,
                142,
                108
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.5625,
            "hue": 42,
            "saturation": 0.273438,
            "lightness": 1.28906,
            "rgb": [
                157,
                142,
                108
            ]
        },
        "metal": {
            "brightness": 27,
            "contrast": 1.5625,
            "hue": 42,
            "saturation": 0.273438,
            "lightness": 1.5625,
            "rgb": [
                139,
                124,
                90
            ]
        }
    },
    "703": {
        "name": "Tarnished Silver",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.28906,
            "hue": 42,
            "saturation": 0.273438,
            "lightness": 1.32813,
            "rgb": [
                169,
                156,
                129
            ]
        },
        "leather": {
            "brightness": 47,
            "contrast": 1.52344,
            "hue": 42,
            "saturation": 0.273438,
            "lightness": 1.48438,
            "rgb": [
                196,
                181,
                148
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.64063,
            "hue": 42,
            "saturation": 0.3125,
            "lightness": 1.5625,
            "rgb": [
                167,
                148,
                108
            ]
        }
    },
    "643": {
        "name": "Nickel",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.5625,
            "hue": 50,
            "saturation": 0.195313,
            "lightness": 1.28906,
            "rgb": [
                136,
                130,
                102
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.5625,
            "hue": 50,
            "saturation": 0.195313,
            "lightness": 1.28906,
            "rgb": [
                136,
                130,
                102
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.79688,
            "hue": 50,
            "saturation": 0.195313,
            "lightness": 1.5625,
            "rgb": [
                124,
                117,
                85
            ]
        }
    },
    "645": {
        "name": "Old Nickel",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 22,
            "contrast": 1.44531,
            "hue": 50,
            "saturation": 0.195313,
            "lightness": 1.28906,
            "rgb": [
                107,
                101,
                76
            ]
        },
        "leather": {
            "brightness": 27,
            "contrast": 1.5625,
            "hue": 50,
            "saturation": 0.195313,
            "lightness": 1.28906,
            "rgb": [
                110,
                104,
                77
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.5625,
            "hue": 50,
            "saturation": 0.195313,
            "lightness": 1.40625,
            "rgb": [
                91,
                85,
                57
            ]
        }
    },
    "627": {
        "name": "Lead",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.36719,
            "hue": 145,
            "saturation": 0.0625,
            "lightness": 1.28906,
            "rgb": [
                71,
                81,
                75
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.36719,
            "hue": 145,
            "saturation": 0.0625,
            "lightness": 1.28906,
            "rgb": [
                84,
                94,
                88
            ]
        },
        "metal": {
            "brightness": -2,
            "contrast": 1.17188,
            "hue": 145,
            "saturation": 0.0625,
            "lightness": 1.17188,
            "rgb": [
                47,
                56,
                51
            ]
        }
    },
    "1157": {
        "name": "Forgiveness",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 160,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                62,
                87,
                79
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 160,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                62,
                87,
                79
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 160,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                62,
                87,
                79
            ]
        }
    },
    "597": {
        "name": "Cobalt",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.36719,
            "hue": 190,
            "saturation": 0.117188,
            "lightness": 1.28906,
            "rgb": [
                65,
                79,
                83
            ]
        },
        "leather": {
            "brightness": 27,
            "contrast": 1.5625,
            "hue": 190,
            "saturation": 0.117188,
            "lightness": 1.28906,
            "rgb": [
                85,
                101,
                105
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.40625,
            "hue": 190,
            "saturation": 0.117188,
            "lightness": 1.32813,
            "rgb": [
                63,
                78,
                82
            ]
        }
    },
    "1158": {
        "name": "Sincerity",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 225,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                66,
                72,
                90
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 225,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                66,
                72,
                90
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 225,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                66,
                72,
                90
            ]
        }
    },
    "1159": {
        "name": "Pride",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 250,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                71,
                67,
                90
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 250,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                71,
                67,
                90
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 250,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                71,
                67,
                90
            ]
        }
    },
    "314": {
        "name": "Tungsten",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1,
            "hue": 345,
            "saturation": 0.078125,
            "lightness": 1.25,
            "rgb": [
                72,
                63,
                66
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1,
            "hue": 345,
            "saturation": 0.078125,
            "lightness": 1.25,
            "rgb": [
                72,
                63,
                66
            ]
        },
        "metal": {
            "brightness": -2,
            "contrast": 1.13281,
            "hue": 350,
            "saturation": 0.101563,
            "lightness": 1.36719,
            "rgb": [
                71,
                59,
                61
            ]
        }
    },
    "1161": {
        "name": "Mischief",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 0,
            "saturation": 0.117188,
            "lightness": 1.5625,
            "rgb": [
                87,
                71,
                71
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 0,
            "saturation": 0.117188,
            "lightness": 1.5625,
            "rgb": [
                87,
                71,
                71
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 0,
            "saturation": 0.117188,
            "lightness": 1.5625,
            "rgb": [
                87,
                71,
                71
            ]
        }
    },
    "1160": {
        "name": "Arrogance",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 320,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                87,
                62,
                79
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 320,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                87,
                62,
                79
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 320,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                87,
                62,
                79
            ]
        }
    },
    "1": {
        "name": "Dye Remover",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 15,
            "contrast": 1.25,
            "hue": 38,
            "saturation": 0.28125,
            "lightness": 1.44531,
            "rgb": [
                124,
                108,
                83
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1,
            "hue": 34,
            "saturation": 0.3125,
            "lightness": 1.09375,
            "rgb": [
                65,
                49,
                29
            ]
        },
        "metal": {
            "brightness": 5,
            "contrast": 1.05469,
            "hue": 38,
            "saturation": 0.101563,
            "lightness": 1.36719,
            "rgb": [
                96,
                91,
                83
            ]
        }
    },
    "1240": {
        "name": "Flame",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.83594,
            "hue": 13,
            "saturation": 0.585938,
            "lightness": 1.83594,
            "rgb": [
                139,
                46,
                18
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.83594,
            "hue": 13,
            "saturation": 0.429688,
            "lightness": 1.5625,
            "rgb": [
                110,
                42,
                21
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.99219,
            "hue": 8,
            "saturation": 0.703125,
            "lightness": 1.83594,
            "rgb": [
                161,
                31,
                8
            ]
        }
    },
    "1239": {
        "name": "Molten",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 27,
            "contrast": 1.83594,
            "hue": 30,
            "saturation": 0.625,
            "lightness": 1.5625,
            "rgb": [
                156,
                89,
                21
            ]
        },
        "leather": {
            "brightness": 27,
            "contrast": 1.83594,
            "hue": 30,
            "saturation": 0.507813,
            "lightness": 1.5625,
            "rgb": [
                144,
                89,
                34
            ]
        },
        "metal": {
            "brightness": 27,
            "contrast": 1.83594,
            "hue": 25,
            "saturation": 0.78125,
            "lightness": 1.83594,
            "rgb": [
                193,
                96,
                25
            ]
        }
    },
    "1237": {
        "name": "Pyre",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.99219,
            "hue": 40,
            "saturation": 0.78125,
            "lightness": 1.83594,
            "rgb": [
                203,
                140,
                22
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.99219,
            "hue": 40,
            "saturation": 0.546875,
            "lightness": 1.83594,
            "rgb": [
                178,
                135,
                52
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.99219,
            "hue": 35,
            "saturation": 0.9375,
            "lightness": 1.83594,
            "rgb": [
                226,
                133,
                7
            ]
        }
    },
    "1238": {
        "name": "Flare",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 47,
            "contrast": 1.99219,
            "hue": 45,
            "saturation": 0.625,
            "lightness": 1.83594,
            "rgb": [
                218,
                180,
                77
            ]
        },
        "leather": {
            "brightness": 47,
            "contrast": 1.99219,
            "hue": 45,
            "saturation": 0.46875,
            "lightness": 1.83594,
            "rgb": [
                203,
                175,
                97
            ]
        },
        "metal": {
            "brightness": 47,
            "contrast": 1.99219,
            "hue": 45,
            "saturation": 0.703125,
            "lightness": 1.83594,
            "rgb": [
                226,
                183,
                66
            ]
        }
    },
    "1241": {
        "name": "Charred",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.83594,
            "hue": 30,
            "saturation": 0.078125,
            "lightness": 1.5625,
            "rgb": [
                66,
                58,
                49
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.83594,
            "hue": 30,
            "saturation": 0.078125,
            "lightness": 1.5625,
            "rgb": [
                66,
                58,
                49
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.83594,
            "hue": 30,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                74,
                58,
                41
            ]
        }
    },
    "1242": {
        "name": "Cinders",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 37,
            "contrast": 1.99219,
            "hue": 56,
            "saturation": 0.125,
            "lightness": 1.99219,
            "rgb": [
                142,
                139,
                115
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.99219,
            "hue": 56,
            "saturation": 0.125,
            "lightness": 1.99219,
            "rgb": [
                142,
                139,
                115
            ]
        },
        "metal": {
            "brightness": 37,
            "contrast": 1.99219,
            "hue": 56,
            "saturation": 0.125,
            "lightness": 1.99219,
            "rgb": [
                142,
                139,
                115
            ]
        }
    },
    "1236": {
        "name": "Deep Glacial Sky",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.75781,
            "hue": 200,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                48,
                69,
                80
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.75781,
            "hue": 200,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                48,
                69,
                80
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.83594,
            "hue": 200,
            "saturation": 0.195313,
            "lightness": 1.75781,
            "rgb": [
                24,
                51,
                66
            ]
        }
    },
    "1235": {
        "name": "Deep Glacial Teal",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.75781,
            "hue": 175,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                47,
                77,
                74
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.75781,
            "hue": 175,
            "saturation": 0.15625,
            "lightness": 1.5625,
            "rgb": [
                47,
                77,
                74
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.83594,
            "hue": 175,
            "saturation": 0.195313,
            "lightness": 1.75781,
            "rgb": [
                23,
                61,
                58
            ]
        }
    },
    "1234": {
        "name": "Shiver Sea",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 42,
            "contrast": 1.99219,
            "hue": 175,
            "saturation": 0.234375,
            "lightness": 1.5625,
            "rgb": [
                87,
                137,
                132
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.83594,
            "hue": 175,
            "saturation": 0.195313,
            "lightness": 1.5625,
            "rgb": [
                111,
                150,
                146
            ]
        },
        "metal": {
            "brightness": 42,
            "contrast": 1.99219,
            "hue": 175,
            "saturation": 0.195313,
            "lightness": 1.83594,
            "rgb": [
                114,
                155,
                151
            ]
        }
    },
    "1232": {
        "name": "Glacial Sky",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 27,
            "contrast": 1.83594,
            "hue": 200,
            "saturation": 0.234375,
            "lightness": 1.5625,
            "rgb": [
                61,
                94,
                111
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.83594,
            "hue": 200,
            "saturation": 0.195313,
            "lightness": 1.5625,
            "rgb": [
                82,
                109,
                123
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.99219,
            "hue": 200,
            "saturation": 0.15625,
            "lightness": 1.83594,
            "rgb": [
                83,
                107,
                120
            ]
        }
    },
    "1231": {
        "name": "Glacial Teal",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 27,
            "contrast": 1.83594,
            "hue": 175,
            "saturation": 0.234375,
            "lightness": 1.5625,
            "rgb": [
                60,
                106,
                101
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.83594,
            "hue": 175,
            "saturation": 0.195313,
            "lightness": 1.5625,
            "rgb": [
                80,
                118,
                115
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.99219,
            "hue": 175,
            "saturation": 0.15625,
            "lightness": 1.83594,
            "rgb": [
                82,
                115,
                112
            ]
        }
    },
    "1233": {
        "name": "Shiver Sky",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 42,
            "contrast": 1.99219,
            "hue": 200,
            "saturation": 0.234375,
            "lightness": 1.5625,
            "rgb": [
                89,
                125,
                143
            ]
        },
        "leather": {
            "brightness": 42,
            "contrast": 1.83594,
            "hue": 200,
            "saturation": 0.195313,
            "lightness": 1.5625,
            "rgb": [
                113,
                140,
                154
            ]
        },
        "metal": {
            "brightness": 42,
            "contrast": 1.99219,
            "hue": 200,
            "saturation": 0.195313,
            "lightness": 1.83594,
            "rgb": [
                115,
                145,
                160
            ]
        }
    },
    "1244": {
        "name": "Acrid",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.5625,
            "hue": 70,
            "saturation": 0.390625,
            "lightness": 1.71875,
            "rgb": [
                110,
                122,
                54
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.5625,
            "hue": 70,
            "saturation": 0.390625,
            "lightness": 1.71875,
            "rgb": [
                110,
                122,
                54
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.5625,
            "hue": 70,
            "saturation": 0.429688,
            "lightness": 1.83594,
            "rgb": [
                117,
                131,
                57
            ]
        }
    },
    "1245": {
        "name": "Acid",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.5625,
            "hue": 63,
            "saturation": 0.664063,
            "lightness": 1.28906,
            "rgb": [
                91,
                97,
                0
            ]
        },
        "leather": {
            "brightness": 12,
            "contrast": 1.5625,
            "hue": 63,
            "saturation": 0.664063,
            "lightness": 1.28906,
            "rgb": [
                91,
                97,
                0
            ]
        },
        "metal": {
            "brightness": 12,
            "contrast": 1.71875,
            "hue": 63,
            "saturation": 0.664063,
            "lightness": 1.5625,
            "rgb": [
                90,
                97,
                0
            ]
        }
    },
    "1248": {
        "name": "Algae",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.75781,
            "hue": 75,
            "saturation": 0.703125,
            "lightness": 1.28906,
            "rgb": [
                76,
                114,
                0
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.75781,
            "hue": 75,
            "saturation": 0.703125,
            "lightness": 1.28906,
            "rgb": [
                76,
                114,
                0
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.75781,
            "hue": 75,
            "saturation": 0.78125,
            "lightness": 1.40625,
            "rgb": [
                97,
                139,
                0
            ]
        }
    },
    "1246": {
        "name": "Toxin",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1.32813,
            "hue": 75,
            "saturation": 0.703125,
            "lightness": 1.71875,
            "rgb": [
                70,
                99,
                0
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1.48438,
            "hue": 70,
            "saturation": 0.703125,
            "lightness": 1.83594,
            "rgb": [
                62,
                84,
                0
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.48438,
            "hue": 70,
            "saturation": 0.703125,
            "lightness": 1.83594,
            "rgb": [
                62,
                84,
                0
            ]
        }
    },
    "1243": {
        "name": "Caustic",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1.17188,
            "hue": 65,
            "saturation": 1.01563,
            "lightness": 1.5625,
            "rgb": [
                53,
                65,
                0
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1.09375,
            "hue": 65,
            "saturation": 0.78125,
            "lightness": 1.5625,
            "rgb": [
                52,
                60,
                0
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1.5625,
            "hue": 60,
            "saturation": 0.78125,
            "lightness": 1.5625,
            "rgb": [
                34,
                34,
                0
            ]
        }
    },
    "1247": {
        "name": "Swampblack",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1.28906,
            "hue": 65,
            "saturation": 0.28125,
            "lightness": 0.9375,
            "rgb": [
                33,
                36,
                0
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1.28906,
            "hue": 65,
            "saturation": 0.28125,
            "lightness": 0.9375,
            "rgb": [
                33,
                36,
                0
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1.32813,
            "hue": 65,
            "saturation": 0.28125,
            "lightness": 0.9375,
            "rgb": [
                31,
                34,
                0
            ]
        }
    },
    "1254": {
        "name": "Blacklight",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1.25,
            "hue": 275,
            "saturation": 0.507813,
            "lightness": 1.5625,
            "rgb": [
                61,
                18,
                93
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1.25,
            "hue": 275,
            "saturation": 0.3125,
            "lightness": 1.5625,
            "rgb": [
                60,
                33,
                79
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.25,
            "hue": 275,
            "saturation": 0.507813,
            "lightness": 1.5625,
            "rgb": [
                61,
                18,
                93
            ]
        }
    },
    "1249": {
        "name": "Cobolt",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 250,
            "saturation": 0.507813,
            "lightness": 1.71875,
            "rgb": [
                68,
                53,
                130
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 250,
            "saturation": 0.429688,
            "lightness": 1.71875,
            "rgb": [
                70,
                58,
                123
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 250,
            "saturation": 0.507813,
            "lightness": 1.71875,
            "rgb": [
                68,
                53,
                130
            ]
        }
    },
    "1252": {
        "name": "Cyanide",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -5,
            "contrast": 1.28906,
            "hue": 185,
            "saturation": 1.01563,
            "lightness": 1.5625,
            "rgb": [
                0,
                85,
                98
            ]
        },
        "leather": {
            "brightness": -5,
            "contrast": 1.28906,
            "hue": 178,
            "saturation": 0.78125,
            "lightness": 1.5625,
            "rgb": [
                0,
                83,
                79
            ]
        },
        "metal": {
            "brightness": -3,
            "contrast": 1.40625,
            "hue": 178,
            "saturation": 1.01563,
            "lightness": 1.5625,
            "rgb": [
                0,
                92,
                86
            ]
        }
    },
    "1251": {
        "name": "Limonite",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 12,
            "contrast": 1.36719,
            "hue": 66,
            "saturation": 0.9375,
            "lightness": 1.5625,
            "rgb": [
                127,
                143,
                5
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.28906,
            "hue": 58,
            "saturation": 0.9375,
            "lightness": 1.5625,
            "rgb": [
                128,
                123,
                2
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.36719,
            "hue": 55,
            "saturation": 1.17188,
            "lightness": 1.5625,
            "rgb": [
                139,
                122,
                0
            ]
        }
    },
    "1253": {
        "name": "Vincent",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -3,
            "contrast": 1.25,
            "hue": 285,
            "saturation": 0.3125,
            "lightness": 0.9375,
            "rgb": [
                41,
                9,
                53
            ]
        },
        "leather": {
            "brightness": -3,
            "contrast": 1.25,
            "hue": 285,
            "saturation": 0.273438,
            "lightness": 0.9375,
            "rgb": [
                40,
                12,
                51
            ]
        },
        "metal": {
            "brightness": -8,
            "contrast": 1.32813,
            "hue": 295,
            "saturation": 0.390625,
            "lightness": 0.9375,
            "rgb": [
                35,
                0,
                40
            ]
        }
    },
    "1250": {
        "name": "Violite",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 17,
            "contrast": 1.48438,
            "hue": 270,
            "saturation": 0.351563,
            "lightness": 1.67969,
            "rgb": [
                102,
                71,
                133
            ]
        },
        "leather": {
            "brightness": 17,
            "contrast": 1.48438,
            "hue": 270,
            "saturation": 0.351563,
            "lightness": 1.67969,
            "rgb": [
                102,
                71,
                133
            ]
        },
        "metal": {
            "brightness": 17,
            "contrast": 1.48438,
            "hue": 270,
            "saturation": 0.351563,
            "lightness": 1.67969,
            "rgb": [
                102,
                71,
                133
            ]
        }
    },
    "1269": {
        "name": "Amenity",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.71875,
            "hue": 200,
            "saturation": 0.429688,
            "lightness": 1.36719,
            "rgb": [
                55,
                111,
                141
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.67969,
            "hue": 200,
            "saturation": 0.3125,
            "lightness": 1.36719,
            "rgb": [
                72,
                112,
                133
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.75781,
            "hue": 200,
            "saturation": 0.390625,
            "lightness": 1.5625,
            "rgb": [
                38,
                90,
                117
            ]
        }
    },
    "1265": {
        "name": "Fling",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.71875,
            "hue": 0,
            "saturation": 0.429688,
            "lightness": 1.44531,
            "rgb": [
                158,
                83,
                83
            ]
        },
        "leather": {
            "brightness": 27,
            "contrast": 1.5625,
            "hue": 0,
            "saturation": 0.351563,
            "lightness": 1.25,
            "rgb": [
                132,
                76,
                76
            ]
        },
        "metal": {
            "brightness": 32,
            "contrast": 1.83594,
            "hue": 0,
            "saturation": 0.429688,
            "lightness": 1.36719,
            "rgb": [
                145,
                64,
                64
            ]
        }
    },
    "1268": {
        "name": "Onset",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 27,
            "contrast": 1.71875,
            "hue": 90,
            "saturation": 0.351563,
            "lightness": 1.36719,
            "rgb": [
                89,
                124,
                53
            ]
        },
        "leather": {
            "brightness": 27,
            "contrast": 1.5625,
            "hue": 90,
            "saturation": 0.3125,
            "lightness": 1.28906,
            "rgb": [
                97,
                126,
                68
            ]
        },
        "metal": {
            "brightness": 27,
            "contrast": 1.83594,
            "hue": 90,
            "saturation": 0.390625,
            "lightness": 1.36719,
            "rgb": [
                78,
                120,
                35
            ]
        }
    },
    "1267": {
        "name": "Perseverance",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.71875,
            "hue": 30,
            "saturation": 0.46875,
            "lightness": 1.44531,
            "rgb": [
                156,
                108,
                61
            ]
        },
        "leather": {
            "brightness": 22,
            "contrast": 1.5625,
            "hue": 30,
            "saturation": 0.390625,
            "lightness": 1.25,
            "rgb": [
                118,
                82,
                46
            ]
        },
        "metal": {
            "brightness": 27,
            "contrast": 1.83594,
            "hue": 30,
            "saturation": 0.507813,
            "lightness": 1.36719,
            "rgb": [
                133,
                78,
                23
            ]
        }
    },
    "1266": {
        "name": "Prosperity",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.71875,
            "hue": 50,
            "saturation": 0.507813,
            "lightness": 1.44531,
            "rgb": [
                146,
                128,
                50
            ]
        },
        "leather": {
            "brightness": 32,
            "contrast": 1.67969,
            "hue": 50,
            "saturation": 0.390625,
            "lightness": 1.25,
            "rgb": [
                125,
                112,
                53
            ]
        },
        "metal": {
            "brightness": 27,
            "contrast": 1.83594,
            "hue": 50,
            "saturation": 0.507813,
            "lightness": 1.36719,
            "rgb": [
                118,
                99,
                15
            ]
        }
    },
    "1270": {
        "name": "Recall",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 32,
            "contrast": 1.71875,
            "hue": 280,
            "saturation": 0.429688,
            "lightness": 1.36719,
            "rgb": [
                111,
                55,
                141
            ]
        },
        "leather": {
            "brightness": 37,
            "contrast": 1.71875,
            "hue": 280,
            "saturation": 0.3125,
            "lightness": 1.36719,
            "rgb": [
                122,
                82,
                144
            ]
        },
        "metal": {
            "brightness": 22,
            "contrast": 1.75781,
            "hue": 280,
            "saturation": 0.390625,
            "lightness": 1.5625,
            "rgb": [
                90,
                38,
                117
            ]
        }
    },
    "1276": {
        "name": "Enameled Crimson",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -18,
            "contrast": 1.40625,
            "hue": 350,
            "saturation": 0.898438,
            "lightness": 1.5625,
            "rgb": [
                78,
                0,
                0
            ]
        },
        "leather": {
            "brightness": -18,
            "contrast": 1.40625,
            "hue": 350,
            "saturation": 0.898438,
            "lightness": 1.5625,
            "rgb": [
                78,
                0,
                0
            ]
        },
        "metal": {
            "brightness": -23,
            "contrast": 1.40625,
            "hue": 350,
            "saturation": 0.898438,
            "lightness": 1.5625,
            "rgb": [
                63,
                0,
                0
            ]
        }
    },
    "1275": {
        "name": "Enameled Emblaze",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -10,
            "contrast": 1.5625,
            "hue": 45,
            "saturation": 1.17188,
            "lightness": 1.5625,
            "rgb": [
                90,
                34,
                0
            ]
        },
        "leather": {
            "brightness": -10,
            "contrast": 1.5625,
            "hue": 45,
            "saturation": 1.17188,
            "lightness": 1.5625,
            "rgb": [
                90,
                34,
                0
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1.5625,
            "hue": 38,
            "saturation": 1.17188,
            "lightness": 1.5625,
            "rgb": [
                91,
                10,
                0
            ]
        }
    },
    "1272": {
        "name": "Enameled Jungle",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.5625,
            "hue": 100,
            "saturation": 0.328125,
            "lightness": 1.5625,
            "rgb": [
                49,
                88,
                29
            ]
        },
        "leather": {
            "brightness": 2,
            "contrast": 1.5625,
            "hue": 100,
            "saturation": 0.328125,
            "lightness": 1.5625,
            "rgb": [
                34,
                72,
                13
            ]
        },
        "metal": {
            "brightness": 2,
            "contrast": 1.71875,
            "hue": 100,
            "saturation": 0.328125,
            "lightness": 1.99219,
            "rgb": [
                23,
                66,
                0
            ]
        }
    },
    "1271": {
        "name": "Enameled Legacy",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": -8,
            "contrast": 1.36719,
            "hue": 52,
            "saturation": 1.17188,
            "lightness": 1.5625,
            "rgb": [
                96,
                70,
                0
            ]
        },
        "leather": {
            "brightness": -8,
            "contrast": 1.36719,
            "hue": 52,
            "saturation": 1.17188,
            "lightness": 1.5625,
            "rgb": [
                96,
                70,
                0
            ]
        },
        "metal": {
            "brightness": -13,
            "contrast": 1.36719,
            "hue": 48,
            "saturation": 1.17188,
            "lightness": 1.5625,
            "rgb": [
                87,
                47,
                0
            ]
        }
    },
    "1274": {
        "name": "Enameled Reign",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.5625,
            "hue": 300,
            "saturation": 0.390625,
            "lightness": 1.5625,
            "rgb": [
                76,
                14,
                76
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.5625,
            "hue": 300,
            "saturation": 0.390625,
            "lightness": 1.5625,
            "rgb": [
                76,
                14,
                76
            ]
        },
        "metal": {
            "brightness": 7,
            "contrast": 1.5625,
            "hue": 300,
            "saturation": 0.390625,
            "lightness": 1.5625,
            "rgb": [
                76,
                14,
                76
            ]
        }
    },
    "1273": {
        "name": "Enamelled Sky",
        "base_rgb": [
            128,
            26,
            26
        ],
        "cloth": {
            "brightness": 7,
            "contrast": 1.5625,
            "hue": 190,
            "saturation": 0.46875,
            "lightness": 1.5625,
            "rgb": [
                6,
                72,
                87
            ]
        },
        "leather": {
            "brightness": 7,
            "contrast": 1.5625,
            "hue": 190,
            "saturation": 0.46875,
            "lightness": 1.5625,
            "rgb": [
                6,
                72,
                87
            ]
        },
        "metal": {
            "brightness": 2,
            "contrast": 1.71875,
            "hue": 190,
            "saturation": 0.46875,
            "lightness": 1.99219,
            "rgb": [
                0,
                48,
                65
            ]
        }

    }
};