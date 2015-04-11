[My website](http://mishareyzlin.com)
-------------------------------------

Built with: [Nesta CMS](http://nestacms.com), [Markdown](http://daringfireball.net/projects/markdown/), [HAML](http://haml-lang.com/), [SCSS](http://sass-lang.com/), [CoffeeScript](http://jashkenas.github.com/coffee-script/), [Typogruby](http://avdgaag.github.com/typogruby/) and various other open-source tools, such as git, vim, ssh.

Hosted on [heroku](http://heroku.com).

Theme code can be found [in theme folder](https://github.com/gryzzly/mishareyzlin.com/tree/master/themes/mr).

Running the site
----------------

Make sure you have ruby dev environment installed. RVM + bundler are required. 

Get RVM 

    \curl -sSL https://get.rvm.io | bash -s stable

Set RVM paths and source relevant .bashrc or .profile files. Run `rvm use` and see what ruby version the Gemfile used. Then `install` and `use` correct ruby version. Install bundler and app deps:
   
```
gem install bundler 
bundle install
```

Start the app
```
bundle exec rackup -p 9292 config.ru &
```

Deploying
---------

First time: install heroku toolbelt, add it to `PATH` and login to heroku. Add heroku remote.

    wget -qO- https://toolbelt.heroku.com/install.sh | sh
    echo 'PATH="/usr/local/heroku/bin:$PATH"' >> ~/.bashrc
    heroku login
    heroku git:remote -a mishareyzlincom

Push to heroku

	git push heroku master

