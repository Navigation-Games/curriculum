---
title: Running EasyGecNG
sidebar_position: 3
description: Step-by-step EasyGecNG operation for a class (COM port, opening a course file, reading SI cards), practice scenarios, tabular view, clean course files, assigning SI cards to students, new courses, and mass-start Score-O.
---

import {Steps, Step} from '@site/src/components/StepTable';
import {Pic, PhotoRow} from '@site/src/components/Pic';

# Running EasyGecNG

Before class:

- **Charge the laptop** between classes.
- **Print this page and keep it with the computer** during class.
- **Know your school's IT help desk number.**

## What you need

- SI boxes: checkpoints 31 to 40, Clear, Start and Finish
- The mini reader (download box), with its USB cord
- SI cards
- A laptop with EasyGecNG installed ([Installing EasyGecNG](../installing))
- A course file (`.egc`) with the courses already built. See [Clean course files](#clean-course-files).

## Steps

<Steps>
<Step n="1" title="Sign in to the laptop">
</Step>
<Step n="2" title="Connect the mini reader" img="/img/electronic-timing/mini-reader.png" alt="Mini reader" imgWidth={110}>

Plug it into a USB port. It beeps twice.

</Step>
<Step n="3" title="Start EasyGecNG">

Double-click the EasyGecNG shortcut on the Desktop, or open the EasyGecNG folder, then `bin`, and double-click **EasyGecNG.bat** (see [Installing EasyGecNG](../installing#4-start-easygecng)).

</Step>
<Step n="4" title="Check the COM port" img="/img/electronic-timing/com-port-blank.png" alt="A blank COM Port menu with the blue and white arrow" imgWidth={240}>

Under "Reading Si-card", look at the **COM Port** menu. If it's blank, click it and choose a port. If there are no choices, check that the mini reader is plugged in, then click the blue and white arrow next to the menu to look again. If there is more than one COM port, you may need to try each one until cards read (step 10).

</Step>
<Step n="5" title="Open the course file" img="/img/electronic-timing/open-file-icon.png" alt="The Open File icon" imgWidth={60}>

Click the **Open File** icon (under File, the second icon) and open the Animal-O `.egc` file from a folder on the Desktop (usually `Orienteering Courses` > your school > the activity name). If EasyGecNG asks "Do you want to save the current event?", click **No**.

</Step>
<Step n="6" title="Check the output mode" img="/img/electronic-timing/tabular-to-face.png" alt="The table icon changes to the smiley face icon" imgWidth={200}>

Results should show as a smiley face (pass) or a sad face (mistake). Newer versions start this way: the first icon under **Parameters** is a smiley face. If it's a table, click it to change to face view.

</Step>
<Step n="7" title="Set the display time" img="/img/electronic-timing/display-settings-icon.png" alt="The tools icon" imgWidth={60}>

Click the tools icon under Parameters to set how many seconds each result stays on the screen. We like 2 seconds (the minimum) so students can download quickly one after another. When students are just starting, or to help them understand a mistake, set it longer.

</Step>
<Step n="8" title="Click the green Start button" img="/img/electronic-timing/start-to-stop.png" alt="The green Start button changes to the red Stop button" imgWidth={200}>

The button is next to "Zero time". It turns orange, then red, and the mini reader beeps twice. EasyGecNG is now ready to read cards. If the button stays orange, see [Troubleshooting](../troubleshooting#easygecng-doesnt-read-si-cards).

</Step>
<Step n="9" title="Try a course yourself before the students do" img="/img/electronic-timing/si-card.png" alt="An SI card" imgWidth={110}>

Take an SI card and check in at the boxes in order: Clear, Start, the checkpoints on one of your courses, then Finish. That is super important. The best time is before you set the checkpoints out, with the boxes side by side, so only a second or two passes between check-ins. If a box's clock has drifted, even a little, a quick course like this shows it: you get a sad face for a course you did right. Then [synchronize the boxes](../maintenance#synchronizing-the-si-boxes) before class.

</Step>
<Step n="10" title="Download the SI card" img="/img/electronic-timing/mini-reader.png" alt="Mini reader" imgWidth={110}>

Put the card in the mini reader. The reader beeps once, and the computer shows the result and plays a sound. If nothing happens, see [Troubleshooting](../troubleshooting). The most common fix is choosing a different COM port.

</Step>
<Step n="11" title="When you're done" img="/img/electronic-timing/save-event-prompt.png" alt="Do you want to save the current event?" imgWidth={240}>

Close EasyGecNG with the X at the top right. When it asks "Do you want to save the current event?", click **No** unless you want to keep the results.

</Step>
</Steps>

## Practice scenarios

Before class, repeat steps 9 and 10 to see what EasyGecNG shows when:

- You mispunch (skip a checkpoint or visit them out of order)
- You forget to check in at the Clear box before the course
- You forget to check in at the Start box
- You forget to check in at the Finish box

You don't need to save the file after class unless you want to look at the results later.

## Tabular view

If a student makes a mistake and you have time, switch to tabular view and have them download again to see which checkpoints they visited. Tabular view also lets you fix it when EasyGecNG guesses the wrong course for a student: change the course by hand.

Click the first icon under **Parameters** to switch between the two views. It shows the view you're in: a smiley face in face view, a table in tabular view. Switch back to face view afterward.

<PhotoRow>
<Pic src="/img/electronic-timing/parameters-face-view.png" caption="Face view" width={180} />
<Pic src="/img/electronic-timing/parameters-tabular-view.png" caption="Tabular view" width={180} />
</PhotoRow>

## Clean course files

EasyGecNG saves everything in files ending in `.egc`:

- **Courses**: the sequence of checkpoint codes for each course
- **Orienteers**: each SI card number, and the student's name if you entered it
- **Results**: the checkpoints each student visited on each course, and their time

Each time you save, all the results are saved in the file. If you use the same file for many classes, the results pile up and the file gets big and slow. Start fresh with a clean copy from time to time.

Download clean course files for the animals in your kit:

- **[Classic animals](https://drive.google.com/drive/folders/1RFKnIUBX-Wkrju4UiEa98A7pknrj8b0J?usp=drive_link)**
- **[Carlson animals](https://drive.google.com/drive/folders/1eWLyyZ4q5q-jDUCuoQuPK9-0AL8Y3uYU?usp=drive_link)**

To make a fresh copy on the laptop:

1. Open the `Orienteering Courses` folder on the Desktop.
2. Make a new folder for the copy.
3. Open the `Clean - copy from here` folder, copy `Animal-O_30s_and_40s.egc` (Ctrl-C), and paste it into your new folder (Ctrl-V).

If EasyGecNG then can't save the file (the message may be in French and mention a "fichier"), fix the folder's permissions. See "Access denied" in [Troubleshooting](../troubleshooting#access-denied-or-cant-save-the-file).

## Assigning SI cards to students

When you assign SI cards to students, you can see each student's results by name, and if a card is missing at the end of class, you know whose it is. EasyGecNG shows each student by SI card number until you assign names.

**One at a time:** click the green and white **+** next to the Orienteers box. Type the last name, first name and SI card number, then click **Validate**.

**From a file:** make a text file in Notepad with one line per student: SI card number, last name and first name, separated by semicolons. Choose **Save As**, set the file type to **All files**, and end the file name in `.csv`. Then import it with the icon above the green **+** next to the Orienteers box. For example:

```
2301250;P;Charlie
2301246;B;Barb
2301253;P;Maija
```

## Create a new event and course

1. Click the pencil icon under **File** to start a new event.
2. Click the green and white **+** next to the Courses box and name the course.
3. Click the green and white **+** next to the Codes box and choose the checkpoint codes for the course, in order.
4. Test it by doing the course with an SI card and downloading it.

## Mass-start Score-O

In a Score-O, students visit the checkpoints in any order. EasyGecNG can check whether they got them all and report how many they visited.

In a mass start, everyone starts at the same time and doesn't check in at the Start box. They still need to check in at the Clear box first.

Set up a new course as above, but choose **Mass start** under "Type of Start" and **Score Race** under "Type of course". Enter the time of the mass start. Getting the time right may take some fiddling: download an SI card in tabular view to see EasyGecNG's idea of the current time, and compare it to your watch.
