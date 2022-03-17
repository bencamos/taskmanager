# Taskmanager
## _Definitely an original design_

Runs in your browser to remotely monitor headless servers system usages.

## Features

- More accurate readings, showing true usages.
- Very much not finished.
- Basically the basic stuff the real task manager can do.

## Usage

Access it at : http://_yourip_:81/taskmgr?x=!
Switch filters in console by reassigning varibles.
sortBy = "memory"; // [cpu, mem, disk, net, gpu]
doBigSpacing = 1; // [0, 1]

## Setup

Update these two lines at 150-151 with your system stats.
```
var totMem = _gb_of_ram_ * 1073741824; // Needs to be set to the servers total memory // Will be retrieved automatically in future
var totCPU = _threads_ * 100; // Needs to be set to the servers total CPU // Will be retrieved automatically in future
```

![image](https://user-images.githubusercontent.com/85905323/158806605-87e45b69-4692-4b10-ac0a-11c9acf8bd94.png)

_ripped from azima_
