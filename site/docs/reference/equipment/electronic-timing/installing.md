---
title: Installing EasyGecNG
sidebar_position: 2
description: How to install the SPORTident USB driver, Java 8 and EasyGecNG on a Windows computer, download the latest release from GitHub, and test with the mini reader.
---

import {Pic} from '@site/src/components/Pic';

# Installing EasyGecNG

EasyGecNG runs on Windows. It can also run on Mac and Linux; the [EasyGecNG page on GitHub](https://github.com/Navigation-Games/EasyGecNG) explains how. EasyGecNG is a Java program, and its source code is public if your IT department wants to review it.


:::tip Ask the advisor
Our [Lesson Plan Advisor](/plan-my-lessons/) knows these instructions. Tell it what you see on your screen, and it will walk you through the steps one at a time.
:::

## 1. Install the SPORTident USB driver

Download the USB driver from [SPORTident's software page](https://www.sportident.com/products.html#software) and install it. You may also need to install the Microsoft .NET framework. Restart the computer after installing the driver.

## 2. Install Java 8

EasyGecNG needs Java 8. We use version 8u231. Get it from [Oracle's Java 8 archive](https://www.oracle.com/java/technologies/javase/javase8u211-later-archive-downloads.html) (search the page for "8u231").

Then turn off automatic Java updates, because EasyGecNG needs this older version:

1. Open the Windows Control Panel and search for **Java**. Open the Java Control Panel.
2. On the **Update** tab, uncheck **Check for Updates Automatically**.
3. In the window that pops up, click **Do Not Check**, then **OK**.

## 3. Download EasyGecNG

1. Go to [github.com/Navigation-Games/EasyGecNG](https://github.com/Navigation-Games/EasyGecNG).
2. On the right side of the page, under **Releases**, click the release marked with a green **Latest** label. (Or go straight to the [releases page](https://github.com/Navigation-Games/EasyGecNG/releases) and find the one marked **Latest**.) Skip the releases named "alpha"; those are test builds.
3. Under **Assets** at the bottom of that release, click the `.zip` file (for example, `EasyGecNG-v1.1.2.zip`) to download it.
4. Unzip it: in File Explorer, right-click the downloaded file, choose **Extract All...**, and extract it to a folder you'll remember.

The unzipped folder has `bin`, `documentation` and `lib` folders inside it.

<Pic src="/img/electronic-timing/easygecng-folder.png" alt="The unzipped folder: bin, documentation, lib, LICENSE, README.md" width={240} />

## 4. Start EasyGecNG

Open the `bin` folder and double-click **EasyGecNG.bat**. (If your computer hides file extensions, it's the EasyGecNG file whose type is "Windows Batch File". The other EasyGecNG file, with no extension, is for Mac and Linux.)

<Pic src="/img/electronic-timing/easygecng-bin.png" alt="The bin folder: config.xml, EasyGecNG, EasyGecNG.bat, gecosi.log, temp.html" width={200} />

To make it easier to find in class, right-click that file and choose **Send to > Desktop (create shortcut)**. (On Windows 11, **Send to** is under **Show more options**.)

## 5. Test it

Plug the mini reader into a USB port. It beeps twice. Start EasyGecNG and check that it reads an SI card (see [Running EasyGecNG](../running-easygecng), steps 4 and 8 to 10). Then confirm that you can save results.

If EasyGecNG doesn't read the card, the usual fix is to choose a different COM port. See [Troubleshooting](../troubleshooting).

## 6. Get the course files

Download the clean course files for your animal set (see [Clean course files](../running-easygecng#clean-course-files)) and put them in a folder on the Desktop, such as `Orienteering Courses`.

## Other software

These are useful but not needed to run classes:

- **[SPORTident Config+](https://www.sportident.com/products.html#software)**: for maintaining the SI boxes (checking batteries, synchronizing clocks, changing box numbers). See [Maintaining the SI Boxes](../maintenance).
- **[Purple Pen](https://purplepen.golde.org/)**: for drawing courses on a map.
- **[OpenOrienteering Mapper](https://www.openorienteering.org/apps/mapper/)**: for drawing or updating a map.
- **[EasyGec](http://t.porret.free.fr/lienlogiciel.php?idmenu=60)**: the original program by Thierry Porret (website in French), as a backup if EasyGecNG has a problem. Download it from the "Télécharger" button.
