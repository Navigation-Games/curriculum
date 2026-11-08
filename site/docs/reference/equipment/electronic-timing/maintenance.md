---
title: Maintaining the SI Boxes
sidebar_position: 5
description: Synchronizing the SI box clocks with the SI-Master (quick method and SPORTident Config+ method), checking SI box battery levels, and replacing batteries.
---

# Maintaining the SI Boxes

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

**You need:** the Service/OFF card, the coupling stick, the SI-Master (Clear box), the other SI boxes (31 to 40, Start, Finish), the mini reader, and a laptop with [SPORTident Config+](https://www.sportident.com/products.html#software) installed.

![Service/OFF card](/img/electronic-timing/service-off-card.png)

![Coupling stick](/img/electronic-timing/coupling-stick.png)

![SI-Master (Clear) box](/img/electronic-timing/si-master.png)

1. **Connect the mini reader.** Plug it into a USB port. It beeps twice.
2. **Open SPORTident Config+** from its Desktop shortcut.

   ![SPORTident Config+ icon](/img/electronic-timing/config-plus-icon.png)
3. **Check the device connection.** In the Devices menu, the mini reader should be listed. Click the blue refresh button if it isn't.

   ![The mini reader listed under Devices](/img/electronic-timing/config-devices.png)

4. **Check the connection type.** It should say **Direct**. If it says Remote, click the box to change it.

   ![Connection: Direct](/img/electronic-timing/config-direct.png)

5. **Click Settings.** Config+ reads and shows the mini reader's settings.

   ![Settings](/img/electronic-timing/config-settings.png)

6. **Couple the SI-Master to the mini reader.** Place the SI-Master on top of the mini reader and put the coupling stick through both holes.

   ![SI-Master on the mini reader with the coupling stick](/img/electronic-timing/si-master-on-reader.png)

7. **Change the connection type to Remote** by clicking the connection box.

   ![Connection: Remote](/img/electronic-timing/config-remote.png)
8. **Click Settings.** Config+ reads the SI-Master's settings. If you get an error, couple the boxes again and click Retry.
9. **Check the settings.** They should be: Code number 1, Operating mode CLR - Clear, Operating time 00:10:00. Change them if needed.

   ![SI-Master settings](/img/electronic-timing/si-master-settings.png)

10. **Click Set time.** The SI-Master beeps once.

    ![Set time](/img/electronic-timing/set-time.png)

11. **Close Config+.** You don't need the computer for the rest.
12. **Take the SI-Master and coupling stick off the mini reader.**
13. **Turn off the SI-Master.** Insert the Service/OFF card until the display is blank.
14. **Lay out all the other boxes:** 31 to 40, Start and Finish.

    ![SI boxes laid out](/img/electronic-timing/si-boxes.png)

15. **Set the SI-Master to EXT MA.** With its display blank, insert the Service/OFF card 3 times until the display shows **EXT MA**.

    ![SI-Master showing EXT MA, with the Service/OFF card](/img/electronic-timing/ext-ma.png)

16. **Synchronize each box.** Put the coupling stick in the SI-Master. Place the SI-Master flat on top of a box with the stick in both holes. After a few seconds it beeps, and that box's time is set. If it doesn't beep, line them up again. Repeat for every box.

    ![SI-Master coupled to a box](/img/electronic-timing/sync-coupled.png)

17. **Turn off all the boxes.** Insert the Service/OFF card into each box until its display is blank. Some boxes need it more than once.

    ![Turning off a box with the Service/OFF card](/img/electronic-timing/turn-off-box.png)

## Checking battery levels

**You need:** the Service/OFF card, the coupling stick, all the SI boxes (31 to 40, Start, Finish, Clear), the mini reader, and a laptop with SPORTident Config+.

1. **Connect the mini reader**, **open Config+**, **check the device connection** and **check that the connection type is Direct**, as in steps 1 to 4 above.
2. **Click Settings.**
3. **Couple a box to the mini reader.** Place the box on top of the mini reader and put the coupling stick through both holes.
4. **Change the connection type to Remote.**
5. **Click Settings.** Config+ reads and shows the box's data.
6. **Check the battery:**
   - **Green:** above 3.2 volts is safe.
   - **Yellow:** between 3.0 and 3.2 volts is in between. The box may still work for another event.
   - **Red:** below 3.0 volts is low. Replace the battery.

   ![Battery level in Config+](/img/electronic-timing/battery-level.png)

7. **Write it down.** We recommend tracking each box's battery level over time.
8. **Turn off the box.** Take it and the coupling stick off the mini reader, and insert the Service/OFF card until the display is blank.
9. **Repeat** steps 3 to 8 for each box.

Batteries usually last at least 5 years. To replace them, send the boxes to SPORTident, or [contact Navigation Games](mailto:admin@navigationgames.org).

## More from SPORTident

SPORTident's manuals and software are at [SPORTident Center](https://center.sportident.com/).
