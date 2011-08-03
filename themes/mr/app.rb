# Add Redcarpet support
module Nesta 
  class FileModel 
    def to_html(scope = nil)
      html = convert_to_html @format, scope, markup
      # enable syntax highlighting
      Typogruby.improve html
    end
    
    def convert_to_html(format, scope, text)
      case format
        when :mdown
          Redcarpet.new( text, :smart, :autolink, :fenced_code, :lax_htmlblock).to_html
          # Maruku.new( text ).to_html
        when :haml
          Haml::Engine.new( text ).to_html(scope || Object.new)
        when :textile
          RedCloth.new( text ).to_html
        end
    end
  end
  
  class Page 
    def body(scope = nil)
      body_text = case @format
        when :mdown
          markup.sub(/^#[^#].*$\r?\n(\r?\n)?/, "")
        when :haml
          markup.sub(/^\s*%h1\s+.*$\r?\n(\r?\n)?/, "")
        when :textile
          markup.sub(/^\s*h1\.\s+.*$\r?\n(\r?\n)?/, "")
        end
      self.convert_to_html @format, scope, body_text
    end
  end
end
  
# Add Redcarpet HAML filter
module Haml::Filters::Redcarpet
  include Haml::Filters::Base

  def render(text)
    ::Redcarpet.new(text, :smart, :autolink, :fenced_code, :lax_htmlblock).to_html
  end
end

# Helpers and own routes
module Nesta
  class App
    #
    # Put your assets in themes/mr/public/mr.
    #
    use Rack::Static, :urls => ["/mr"], :root => "themes/mr/public"
    
    helpers do
      # from here: http://benjaminthomas.org/2009-01-30/smart-html-truncate.html
      # https://gist.github.com/101410
      def html_truncate(input, num_words = 15, truncate_string = "...")
        doc = Nokogiri::HTML input

        current = doc.children.first
        count = 0

        while true
          # we found a text node
          if current.text?
            count += current.text.split.length
            # we reached our limit, let's get outta here!
            break if count > num_words
            previous = current
          end

          if current.children.length > 0
            # this node has children, can't be a text node,
            # lets descend and look for text nodes
            current = current.children.first
          elsif !current.next.nil?
            #this has no children, but has a sibling, let's check it out
            current = current.next
          else 
            # we are the last child, we need to ascend until we are
            # either done or find a sibling to continue on to
            n = current
            while !n.is_a?(Nokogiri::HTML::Document) and n.parent.next.nil?
              n = n.parent
            end

            # we've reached the top and found no more text nodes, break
            if n.is_a?(Nokogiri::HTML::Document)
              break;
            else
              current = n.parent.next
            end
          end
        end

        if count >= num_words
          unless count == num_words
            new_content = current.text.split

            # If we're here, the last text node we counted eclipsed the number of words
            # that we want, so we need to cut down on words.  The easiest way to think about
            # this is that without this node we'd have fewer words than the limit, so all
            # the previous words plus a limited number of words from this node are needed.
            # We simply need to figure out how many words are needed and grab that many.
            # Then we need to -subtract- an index, because the first word would be index zero.

            # For example, given:
            # <p>Testing this HTML truncater.</p><p>To see if its working.</p>
            # Let's say I want 6 words.  The correct returned string would be:
            # <p>Testing this HTML truncater.</p><p>To see...</p>
            # All the words in both paragraphs = 9
            # The last paragraph is the one that breaks the limit.  How many words would we
            # have without it? 4.  But we want up to 6, so we might as well get that many.
            # 6 - 4 = 2, so we get 2 words from this node, but words #1-2 are indices #0-1, so
            # we subtract 1.  If this gives us -1, we want nothing from this node. So go back to
            # the previous node instead.
            index = num_words-(count-new_content.length)-1
            if index >= 0
              new_content = new_content[0..index]
              current.content = new_content.join(' ') + truncate_string
            else
              current = previous
              current.content = current.content + truncate_string
            end
          end # unless count == num_words

          # remove everything else
          while !current.is_a?(Nokogiri::HTML::Document)
            while !current.next.nil?
              current.next.remove
            end
            current = current.parent
          end
        end # while true

        # now we grab the html and not the text.
        # we do first because nokogiri adds html and body tags
        # which we don't want
        doc.root.children.first.inner_html
      end # html_truncate
      
      # PromotJS banner
      def promotejs
        begin
          resp = Net::HTTP.get_response(URI.parse('http://promotejs.com/plz')).body
          result = JSON.parse(resp)
        rescue Exception => e
          # in case of error set default values
          result = {
            :href => 'https://developer.mozilla.org/en/JavaScript',
            :src => 'http://static.jsconf.us/promotejsh.gif',
            :alt => 'JS reference'
          }
        end
        "<a href='#{ result['href'] }'>\
          <img src='#{ result['src'] }' alt='#{ result['alt'] }'>\
        </a>"
      end # promotejs
    end

    # robots / humans .txt (served from content folder)
    get '*.txt' do
      file = Nesta::Config.content_path(params[:splat][0] + '.txt')
      if File.exist?(file)
        content_type 'text/plain', :charset => 'utf-8'
        File.open(file).read
      else
        halt 404
      end
    end
    
    # CV pdf
    get '/MishaReyzlinCV.pdf' do
      file = Nesta::Config.content_path('MishaReyzlinCV.pdf')
      if File.exist?(file)
        content_type 'application/pdf'
        File.open(file).read
      else
        halt 404
      end
    end
    
    get '/index.html' do
      redirect '/', 301
    end
    
    get '/works.html' do
      redirect '/works', 301
    end
    
    get '/cv.html' do
      redirect '/cv', 301
    end
    
    get '/contact.html' do
      halt 410
    end
    
    # Add new routes here.
    # get "/blog/" do
    # end
  end
end
