---
title: Maintaining the SI Boxes
sidebar_position: 5
description: Synchronizing the SI box clocks with the SI-Master (quick method and SPORTident Config+ method), checking SI box battery levels, and replacing batteries.
---

import {Steps, Step} from '@site/src/components/StepTable';
import {Pic, PhotoRow} from '@site/src/components/Pic';

# Maintaining the SI Boxes

Maintenance uses these three things:

<PhotoRow>
<Pic src="/img/electronic-timing/service-off-card.png" caption="Service/OFF card" width={200} />
<Pic src="/img/electronic-timing/coupling-stick.png" caption="Coupling stick" width={200} />
<Pic src="/img/electronic-timing/si-master.png" caption="SI-Master (the Clear box)" width={200} />
</PhotoRow>

## Synchronizing the SI boxes

Each SI box has its own clock, and the clocks drift over time. When they drift too far apart, EasyGecNG can tell a student they visited checkpoints out of order when they didn't. Synchronize the boxes every 3 to 4 weeks, and whenever students who did a course right are told they made a mistake.

### Quick method

This copies the SI-Master's clock to all the other boxes, with no computer:

1. Find the box labeled **SI-Master** (it's also the Clear box).
2. Starting with its display blank, insert the purple **Service/OFF** card 3 times until the display shows **EXT MA** (extended master). This also clears its backup memory.
3. Put the metal coupling stick into the SI-Master. Place the SI-Master flat on top of each other box with the other end of the coupling stick in that box's hole, and wait for the beep. That box is now synchronized.
4. Turn the boxes off with the Service/OFF card to save battery.

[Backwoods Orienteering Klubb has detailed instructions with photos](https://backwoodsok.org/check-and-synchronize-si-boxes).

### Full method, with SPORTident Config+

This sets the SI-Master's clock from the computer first, then copies it to every box.

**You need:** the Service/OFF card, the coupling stick, the SI-Master, the other SI boxes (31 to 40, Start, Finish), the mini reader, and a laptop with [SPORTident Config+](https://www.sportident.com/products.html#software) installed.

<Steps>
<Step n="1" title="Connect the mini reader" img="/img/electronic-timing/mini-reader.png" alt="Mini reader" imgWidth={110}>

Plug it into a USB port. It beeps twice.

</Step>
<Step n="2" title="Open SPORTident Config+" img="/img/electronic-timing/config-plus-icon.png" alt="SPORTident Config+ icon" imgWidth={60}>

Double-click its shortcut on the Desktop.

</Step>
<Step n="3" title="Check the device connection" img="/img/electronic-timing/config-devices.png" alt="The mini reader listed under Devices" imgWidth={240}>

In the Devices menu, the mini reader should be listed. Click the blue refresh button if it isn't.

</Step>
<Step n="4" title="Check the connection type" img="/img/electronic-timing/config-direct.png" alt="Connection: Direct" imgWidth={180}>

It should say **Direct**. If it says Remote, click the box to change it.

</Step>
<Step n="5" title="Click Settings" img="/img/electronic-timing/config-settings.png" alt="Settings" imgWidth={220}>

Config+ reads and shows the mini reader's settings.

</Step>
<Step n="6" title="Couple the SI-Master to the mini reader" img="/img/electronic-timing/si-master-on-reader.png" alt="SI-Master on the mini reader with the coupling stick" imgWidth={160}>

Place the SI-Master on top of the mini reader and put the coupling stick through both holes.

</Step>
<Step n="7" title="Change the connection type to Remote" img="/img/electronic-timing/config-remote.png" alt="Connection: Remote" imgWidth={180}>

Click the connection box.

</Step>
<Step n="8" title="Click Settings" img="/img/electronic-timing/config-settings.png" alt="Settings" imgWidth={220}>

Config+ reads the SI-Master's settings. If you get an error, couple the boxes again and click Retry.

</Step>
<Step n="9" title="Check the settings" img="/img/electronic-timing/si-master-settings.png" alt="SI-Master settings: code 1, CLR - Clear, 00:10:00" imgWidth={260}>

They should be: Code number 1, Operating mode CLR - Clear, Operating time 00:10:00. Change them if needed.

</Step>
<Step n="10" title="Click Set time" img="/img/electronic-timing/set-time.png" alt="Set time" imgWidth={260}>

The SI-Master beeps once.

</Step>
<Step n="11" title="Close Config+">

You don't need the computer for the rest.

</Step>
<Step n="12" title="Take the SI-Master and coupling stick off the mini reader">
</Step>
<Step n="13" title="Turn off the SI-Master">

Insert the Service/OFF card until the display is blank.

</Step>
<Step n="14" title="Lay out all the other boxes" img="/img/electronic-timing/si-boxes.png" alt="SI boxes laid out" imgWidth={160}>

Boxes 31 to 40, Start and Finish.

</Step>
<Step n="15" title="Set the SI-Master to EXT MA" img="/img/electronic-timing/ext-ma.png" alt="SI-Master showing EXT MA, with the Service/OFF card" imgWidth={160}>

With its display blank, insert the Service/OFF card 3 times until the display shows **EXT MA**.

</Step>
<Step n="16" title="Synchronize each box" img="/img/electronic-timing/sync-coupled.png" alt="SI-Master coupled to a box" imgWidth={160}>

Put the coupling stick in the SI-Master. Place the SI-Master flat on top of a box with the stick in both holes. After a few seconds it beeps, and that box's time is set. If it doesn't beep, line them up again. Repeat for every box.

</Step>
<Step n="17" title="Turn off all the boxes" img="/img/electronic-timing/turn-off-box.png" alt="Turning off a box with the Service/OFF card" imgWidth={140}>

Insert the Service/OFF card into each box until its display is blank. Some boxes need it more than once.

</Step>
</Steps>

## Checking battery levels

**You need:** the Service/OFF card, the coupling stick, all the SI boxes (31 to 40, Start, Finish, Clear), the mini reader, and a laptop with SPORTident Config+.

<Steps>
<Step n="1" title="Connect Config+ to the mini reader">

Connect the mini reader, open Config+, check the device connection and check that the connection type is **Direct**, as in steps 1 to 4 above.

</Step>
<Step n="2" title="Click Settings">
</Step>
<Step n="3" title="Couple a box to the mini reader">

Place the box on top of the mini reader and put the coupling stick through both holes.

</Step>
<Step n="4" title="Change the connection type to Remote" img="/img/electronic-timing/config-remote.png" alt="Connection: Remote" imgWidth={180}>
</Step>
<Step n="5" title="Click Settings">

Config+ reads and shows the box's data.

</Step>
<Step n="6" title="Check the battery" img="/img/electronic-timing/battery-level.png" alt="Battery level in Config+" imgWidth={260}>

- **Green:** above 3.2 volts is safe.
- **Yellow:** between 3.0 and 3.2 volts is in between. The box may still work for another event.
- **Red:** below 3.0 volts is low. Replace the battery.

</Step>
<Step n="7" title="Write it down">

We recommend tracking each box's battery level over time.

</Step>
<Step n="8" title="Turn off the box">

Take it and the coupling stick off the mini reader, and insert the Service/OFF card until the display is blank.

</Step>
<Step n="9" title="Repeat for each box">

Do steps 3 to 8 for every box.

</Step>
</Steps>

Batteries usually last at least 5 years. To replace them, send the boxes to SPORTident, or [contact Navigation Games](mailto:admin@navigationgames.org).

## More from SPORTident

SPORTident's manuals and software are at [SPORTident Center](https://center.sportident.com/).
