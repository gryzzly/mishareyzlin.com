require 'rubygems'
require 'bundler/setup'

Bundler.require(:default)

require 'nesta/app'
require 'nokogiri'
require 'redcarpet'
require 'typogruby'
require 'json'
require 'net/http'
require 'rack-rewrite'

Nesta::App.root = ::File.expand_path('.', ::File.dirname(__FILE__))

use Rack::Rewrite do
  r301 %r{/index.html(\?.*)}, '/$1'
end

use Rack::Rewrite do
  r301 %r{/cv.html(\?.*)}, '/cv$1'
end

use Rack::Rewrite do
  r301 %r{/works.html(\?.*)}, '/works$1'
end

run Nesta::App
