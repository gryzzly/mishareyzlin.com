Date: 15 April 2011
Categories: nesta, back-end

# First steps in Nesta (and Ruby)

**Note**: this article was updated to work with [Redcarpet 2](https://github.com/tanoku/redcarpet), that is incompatible with first version.

In order to use custom content processing libarary (I wanted to try out new markdown lib from github, Redcarpet) I needed to extend [Nesta](http://nestacms.com)'s FileModel's `to_html` method, like so: 

    module Nesta 
      class FileModel 
        def to_html ( scope = nil )
          html = convert_to_html @format, scope, markup
        end

        def convert_to_html ( format, scope, text )
          @markdown = Redcarpet::Markdown.new(
                        Redcarpet::Render::HTML,
                        :no_intra_emphasis => true,
                        :lax_html_blocks => true,
                        :autolink => true, 
                        :space_after_headers => true
                      )

          case format
            when :mdown
              @markdown.render( text )
              # Maruku.new( text ).to_html
            when :haml
              Haml::Engine.new( text ).to_html(scope || Object.new)
            when :textile
              RedCloth.new( text ).to_html
            end
        end
      end
    end

That allows me to parse content files with Redcarpet instead of default markdown parser, Maruku. But what if I also want to use `:redcarpet` as a filter in HAML? In order to do that, I needed to add new HAML filter:

    module Haml::Filters::Redcarpet
      include Haml::Filters::Base
  
      @markdown = Redcarpet::Markdown.new(
                    Redcarpet::Render::HTML,
                    :no_intra_emphasis => true,
                    :lax_html_blocks => true,
                    :autolink => true, 
                    :space_after_headers => true
                  )
  
      def render ( text )
        @markdown.render text
      end
    end

We can now use `:redcarpet` filter in HAML like so:

    %p
      :redcarpet
        # Here goes markdown content

Another useful note: @page.metadata() method is exposed, i.e. you can specify any key in the top of your pages and you'll be able to access that data in your templates like so:

    - if @page.metadata('foo')
      %h1 @page.metadata('foo')


It's important to note, that if you are going to retrieve values from `@page` in layout, guard yourself with `if`s, because there are pages like 404, that are using layout but don't have associated `@page` model with them, – in that case you wont have `@page` defined, and calling `@page.method` will break.

Sources
-------
1. https://github.com/gma/nesta/blob/master/lib/nesta/models.rb
2. https://github.com/gma/nesta/issues#issue/21