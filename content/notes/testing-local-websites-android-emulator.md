Date: 20 October 2010
Categories: mobile development, configuration, environment

# Testing local running websites on Android Emulator, in OS X environment

In order to test local websites on Android Emulator you need to first install the SDK: 

You can either download Android SDK [here](http://developer.android.com/sdk/) and follow the provided instructions or if you are using [homebrew](http://mxcl.github.com/homebrew/) type this:

    $: brew install android

Then, in order to start android-sdk type:

    $: android

If that throws an error, like the following:

    emulator: ERROR: could not find required kernel image (kernel-qemu).
    emulator: Maybe defining ANDROID_SDK_ROOT to point to a valid SDK installation path might help ?

you can add the following (the example is for default brew installation) in your `~/.profile`:

    # this is required for android SDK to start from terminal
    export ANDROID_SDK_ROOT="/usr/local/Cellar/android-sdk/r6/"

If you haven't installed the emulator via brew, find out where SDK is placed and assign ANDROID_SDK_ROOT that path.

In the application menu include repository and update packages.

Create an instance of emulator and remember its name (say, "test").

When starting your emulator you will have to use the -partition-size command to avoid out-of-memory messages.

    $ emulator -avd [your-emulator-name] -partition-size 128

After emulator has started, in other terminal instance (tab or window), type:

    $ adb remount

This will prevent "read-only file system" problem.

Then, to enter virtual device's shell:

    $ adb -e shell

and within the shell do (replace %YOUR_LOCAL_HOST% with your desired host):

    # echo '10.0.2.2    %YOUR_LOCAL_HOST%' >> /etc/hosts 

"10.0.2.2" is your hosting machine’s IP, – so %YOUR_LOCAL_HOST% will be pointing at your master machine, where web server is running.

Now you can go to the browser on your android emulator and access your locally running development server with desired development domain.

Sources
-------

1. [http://stackoverflow.com/questions/1320241/how-can-i-look-at-locally-hosted-projects-with-the-android-sdk-emulator](http://stackoverflow.com/questions/1320241/how-can-i-look-at-locally-hosted-projects-with-the-android-sdk-emulator)
2. [http://sacoskun.blogspot.com/2009/06/configure-hosts-file-in-android.html](http://sacoskun.blogspot.com/2009/06/configure-hosts-file-in-android.html)
3. [http://github.com/mxcl/homebrew/issues/issue/397](http://github.com/mxcl/homebrew/issues/issue/397)