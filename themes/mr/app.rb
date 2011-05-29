# Add Redcarpet support
module Nesta 
  class FileModel 
    def to_html(scope = nil)
      html = case @format
        when :mdown
          Redcarpet.new(markup, :smart, :autolink, :fenced_code, :lax_htmlblock).to_html
        when :haml
          Haml::Engine.new(markup).to_html(scope || Object.new)
        when :textile
          RedCloth.new(markup).to_html
        end
      Typogruby.improve(html)
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
      def html_truncate( input, num_words = 15, truncate_string = "..." )
        doc = Nokogiri::HTML(input)

        current = doc.children.first
        count = 0

        while true
          if current.is_a?(Nokogiri::XML::Text)
            count += current.text.split.length
            break if count > num_words
            previous = current
          end

          if current.children.length > 0
            current = current.children.first
          elsif !current.next.nil?
            current = current.next
          else 
            n = current
            while !n.is_a?(Nokogiri::HTML::Document) and n.parent.next.nil?
              n = n.parent
            end

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

            index = num_words-(count-new_content.length)-1
            if index >= 0
              new_content = new_content[0..index]
              current.content = new_content.join(' ') + truncate_string
            else
              current = previous
              current.content = current.content + truncate_string
            end
          end

          while !current.is_a?(Nokogiri::HTML::Document)
            while !current.next.nil?
              current.next.remove
            end
            current = current.parent
          end
        end
        
        doc.root.children.first.inner_html
      end # html_truncate
      
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
