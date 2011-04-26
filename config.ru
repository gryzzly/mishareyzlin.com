require 'rubygems'
require 'bundler/setup'

Bundler.require(:default)

require 'nesta/app'
require 'nokogiri'
require 'redcarpet'

Nesta::App.root = ::File.expand_path('.', ::File.dirname(__FILE__))
run Nesta::App
