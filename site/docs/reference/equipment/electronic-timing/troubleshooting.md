---
title: Troubleshooting Electronic Timing
sidebar_label: Troubleshooting
sidebar_position: 4
description: Fixes for EasyGecNG and SPORTident problems - SI cards not reading (try each COM port), boxes not beeping, students told they made a mistake when they did the course right (synchronize the boxes), EasyGecNG not responding, access denied, wrong course, slow files.
---

# Troubleshooting Electronic Timing

Problems are listed by what you see. Try the fixes in order.

## EasyGecNG doesn't read SI cards

You put an SI card in the mini reader and nothing shows on the screen, or the mini reader doesn't beep.

1. **Try a different COM port.** This is the most common fix. Under "Reading Si-card", click the **COM Port** menu. If there is more than one port (for example COM3 and COM4), you have to find the one the mini reader is using. Click the red Stop button, choose another port, click the green Start button, and download a card again. Try each port in the list until a card reads.

   ![Choosing between COM ports](/img/electronic-timing/com-port-choices.webp)

2. **If the COM Port menu is blank**, check that the mini reader is plugged in, then click the blue and white arrow next to the menu to look again. Unplug the mini reader and plug it back in. It should beep twice.

   ![A blank COM Port menu](/img/electronic-timing/com-port-blank.png)

3. **Check that EasyGecNG is reading.** The button next to "Zero time" should be a red square (Stop). If it's a green arrow, click it. If it stays orange instead of turning red, EasyGecNG isn't connected to the mini reader: go back to step 1.

   ![Red Stop button: EasyGecNG is reading cards](/img/electronic-timing/stop-button.png)

4. **Check the driver.** If no COM port works, the SPORTident USB driver may be missing. Install it ([Installing EasyGecNG](../installing)) and restart the computer. If you have SPORTident Config+, see whether it finds the mini reader; if it doesn't either, it's a driver problem.

5. **Check Java.** EasyGecNG needs Java 8 (see [Installing EasyGecNG](../installing)).

## A student gets a sad face

A sad face usually means the student really did skip a checkpoint or go out of order. Often they went to the checkpoint but didn't hold the SI card in the box long enough to get a beep.

1. **Ask them to do the course again.** Remind them how: check in at the Clear box and the Start box, visit the checkpoints in order, hold the SI card in each box until it beeps, and check in at the Finish box. If you have time, download their card in [tabular view](../running-easygecng#tabular-view) to see which checkpoints it recorded.
2. **Check which course EasyGecNG picked.** Sometimes it guesses the wrong course for a student. In tabular view you can see which course it chose and change it by hand.

## Students did the course right, but still get a sad face

If students who you know did the course correctly keep getting a sad face, or the times show the checkpoints out of order:

1. **Check that each box is in the right place.** If two boxes are swapped, students visit them in the wrong order.
2. **Synchronize the boxes.** Each SI box has its own clock, and the clocks drift. When one box's clock is off, EasyGecNG thinks students visited it out of order. Follow [Synchronizing the SI boxes](../maintenance#synchronizing-the-si-boxes). We recommend synchronizing every 3 to 4 weeks anyway.
3. **Test it.** Before you set the checkpoints out, put the boxes side by side and do a course yourself with only a second or two between check-ins. If you get a smiley face, the clocks are close enough.

## The SI boxes don't beep

If a student says a box isn't beeping, they need to clear their SI card at the Clear box, then start again.

If a box doesn't beep for anyone, its battery may be low. See [Checking batteries](../maintenance#checking-battery-levels).

## The student forgot a box

Downloading shows a mistake if a student forgot to check in at the Clear, Start or Finish box. Have them clear the card and run the course again. Try these mistakes yourself before class so you recognize them (see [Practice scenarios](../running-easygecng#practice-scenarios)).

## EasyGecNG stops responding

Try these in order:

1. Click the red Stop button, then the green Start button.
2. Check that a COM port is chosen (see [EasyGecNG doesn't read SI cards](#easygecng-doesnt-read-si-cards)).
3. Unplug the mini reader from the USB port and plug it back in.
4. Close EasyGecNG and start it again.
5. Restart the computer.
6. Use a clean course file. If you use the same file for too long, it builds up so much data that EasyGecNG slows down (see [EasyGecNG is slow](#easygecng-is-slow)).
7. Reinstall the latest USB driver from SPORTident.

## EasyGecNG is slow

If EasyGecNG takes a long time to show results, the course file may have grown too big. Each time you save, all the results go into the `.egc` file, and they pile up over many classes. Look at the file's size in File Explorer. The file in this example has grown to almost 3.5 MB.

![A course folder: the .egc file has grown to 3,467 KB](/img/electronic-timing/egc-file-sizes.webp)

Start over with a clean course file (see [Clean course files](../running-easygecng#clean-course-files)), and click **No** when EasyGecNG asks to save, unless you want to keep the results.

## "Do you want to save the current event?"

EasyGecNG asks this when you close it or open another course file. Click **No**, unless you want to keep the results from this class. Saving every time makes the file grow, and big files slow EasyGecNG down.

![Click No](/img/electronic-timing/save-event-prompt.webp)

## Access denied, or can't save the file

If a message pops up when students download or when you save, partly in French, saying "Erreur d'écriture" (write error) and ending in "(Access is denied)", or EasyGecNG says it can't save the file ("fichier"), the folder holding the `.egc` file is read-only.

![The write error: Erreur d'écriture ... Access is denied](/img/electronic-timing/access-denied-error.png)

To fix it:

1. In File Explorer, go to the folder that holds the `.egc` file. The message shows its location.
2. Right-click the folder and choose **Properties**.
3. Near the bottom, next to **Read-only**, look at the box. If it's checked or filled in, click it until it's empty, then click **OK**.

   ![Folder Properties: the Read-only box is filled in](/img/electronic-timing/folder-properties.png)

4. If Windows asks whether to apply the change to all subfolders and files, choose **Apply changes to this folder, subfolders and files** and click **OK**.

![Apply the change to the folder, subfolders and files](/img/electronic-timing/apply-to-subfolders.png)

## Still stuck?

[Contact Navigation Games](mailto:admin@navigationgames.org) and tell us what you see on the screen. A photo of the screen helps.
