Date: 20 April 2011
Categories: wordpress, php, back-end

# Sort WordPress categories by the recency of their updates

One of our recent clients has a [nice blog](http://www.omami.ru), where homepage shows most recent post from each of the categories. This is done pretty simple in WordPress:

    $categories = get_categories();
    
    foreach($categories as $category ) {
    
      $post_args = array(
        'orderby' => 'post_date',
        'order' => 'DESC',
        'showposts' => 1,
        'category__in' => array($category->term_id),
        'caller_get_posts'=>1
      );
    
      query_posts( $post_args );
    
      while ( have_posts() ) : the_post();
        # I have actual post's code in a separate template
        get_template_part( 'post' );
      endwhile;
    }

But there also was an interesting requirement: categories have to be sorted by the time of update of latest posts. So that the lately updated category will always be shown first and so on. As I haven't found a way to create a custom sorting option to use with `get_categories` (which accepts `orderby => ` option, but is limited to the pre-defined parameters: id, name (default), slug, count, group) I hacked something to make it work as required.

So, the idea is the following: loop through categories, find the latest post in each on of them, store the date when this post was updated, sort categories by these dates and then output posts in the right order.

Here's the code I've used to do that:

    # Get all the categories
    $categories = get_categories(array(
      'type' => 'post',
      'child_of' => 0,
      'orderby' => 'name',
      'order' => 'ASC',
      'hide_empty' => 1,
      'hierarchical' => 1,
    ));
    
    # I store sorted categories array as a global, as I need to use it
    # across different templates: to make a nav in header.php and to actually 
    # loop through the posts in index.php
    $GLOBALS['catsArray'] = array();

    # Loop through categories
    foreach($categories as $category ) {

      $post_args = array(
        'orderby' => 'post_date',
        'order' => 'DESC',
        'showposts' => 1,
        'category__in' => array($category->term_id),
        'caller_get_posts'=>1
      );

      # Retrieve latest post 
      query_posts( $post_args );

      # Cache latest posts data
      # date in Unix format to sort by, post's category (current iteration)
      # and the post itself
      # this is done in order not to run loop twice
      while ( have_posts() ) : the_post();
        $GLOBALS['catsArray'][$category->slug] = array(
          'date' => get_the_time('U'),
          'category' => $category,
          'post' => $post
        );

      endwhile;
  
      # Resetting query
      wp_reset_query();
  
    }

    # Compares two arrays by their "date" field
    function compareDates($a, $b) {
      if ( $a['date'] == $b['date'] ) {
        return 0;
      }

      return ($a['date'] < $b['date']) ? 1 : -1;
    }

    # Sort using defined function
    usort($GLOBALS['catsArray'], "compareDates");

Sources
-------

* http://codex.wordpress.org/Function_Reference/get_categories
* http://codex.wordpress.org/Function_Reference/query_posts
* http://php.net/manual/en/function.usort.php