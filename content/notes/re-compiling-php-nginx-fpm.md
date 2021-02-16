Date: 7 April 2011
Categories: PHP, configuration, nginx

# Re-compiling PHP to be used with FPM and Nginx

If you are just like me, not really a server-side guy and you've suddenly got a need to recompile PHP that you have on your server (in my case, when I first configured my virtual server I followed some tutorial and didn't pay too much attention to what modules I've compiled with, except for php-fpm, that was needed to make things work fast. And so I found myself in a situation where I was getting the following error:

    imagecreatefromstring() [function.imagecreatefromstring] No JPEG support in this PHP build
  
So, as [I found out](http://stackoverflow.com/questions/5554705/imagecreatefromstring-function-imagecreatefromstring-no-jpeg-support-in-this) the best approach to make things work properly was to recompile PHP with explicit JPEG support. 

But, since I wanted also to not break anything else, I needed a list of other options that PHP was built with. So my short notice is exactly about that – I've spent some time looking for a solution and it was actually super easy. 

Run `php -i` in your terminal (which is an equivalent of `<?php phpinfo(); ?>`) but it prints to the command line output. Then among the first lines of output you'll see `Configure Command => ` with exact options PHP was built previous time. It looks like this:

    Configure Command =>  './configure'  '--enable-fastcgi' '--enable-fpm' '--with-mcrypt' '--with-zlib' '--enable-mbstring' '--with-openssl' '--with-mysql' '--with-mysql-sock' '--with-curl' '--with-jpeg-dir=/usr/lib' '--with-gd' '--enable-gd-native-ttf' '--without-sqlite' '--disable-pdo' '--disable-reflection'


Also, if you are recompiling from PHP 5.3.0, where support for FPM needed to be patched in to PHP 5.3.6 (and probably anything higher than 5.3.0) which comes with FPM built-in – be aware that config file syntax has changed from XML to "ini". 

So update your `php-fpm.config` (if you aren't sure where it is, use `locate php-fpm.config`, in my case it resided in `/usr/local/etc`). You can take your old config in XML syntax and copy options to the provided example file (for me it was also found in `/usr/local/etc`).

You'll also need to update your php-fpm daemon script in `/etc/init.d`, to do that first remove an old version: 

    sudo /usr/sbin/update-rc.d -f php-fpm remove
    
then copy `sapi/fpm/init.d.php-fpm` from the folder with PHP source to `/etc/init.d/` like this:
    
    sudo cp -f /usr/local/src/php5.3.6/sapi/fpm/init.d.php-fpm /etc/init.d/.
    
set appropriate permissions:

    chmod 755 /etc/init.d/php-fpm
    
and install the script to manage the service:

    sudo /usr/sbin/update-rc.d -f php-fpm defaults

I also needed to adjust that daemon script (`/etc/init.d/php-fpm`) in order to use it, for me, previous location of `php-fpm.pid` didn't match the provided default value (again, you can find it with `locate php.fpm.pid`).

    php_fpm_BIN=${exec_prefix}/sbin/php-fpm
    php_fpm_CONF=${prefix}/etc/php-fpm.conf
    php_fpm_PID=${prefix}/logs/php-fpm.pid

You should see errors output in the log (you can find the path to log in php-fpm.conf) for the debugging.

Sources
-------

1. http://stackoverflow.com/questions/5554705/imagecreatefromstring-function-imagecreatefromstring-no-jpeg-support-in-this
2. http://interfacelab.com/nginx-php-fpm-apc-awesome/
3. http://forum.nginx.org/read.php?3,82703,82705#msg-82705