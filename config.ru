# this is needed for YAML to work on ruby > 1.9.2
if RUBY_VERSION == "1.9.2"
  require 'yaml'
  YAML::ENGINE.yamler= 'syck'
end

require 'rubygems'
require 'bundler/setup'

Bundler.require(:default)

require 'nesta/app'
require 'nokogiri'
require 'redcarpet'
require 'typogruby'
require 'json'
require 'net/http'
require 'rack/force_domain'

use Rack::ForceDomain, ENV["DOMAIN"]
Nesta::App.root = ::File.expand_path('.', ::File.dirname(__FILE__))

run Nesta::App
