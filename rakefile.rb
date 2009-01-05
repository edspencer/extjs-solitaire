require 'find'

namespace :solitaire do
  
  desc "Concatenates JS files into one called solitaire-all.js"
  task :concatenate do
    files = ["Game.js", "MainWindow.js", "Deck.js", "Dealer.js", "Card.js", "Pack.js", "Stack.js", "SuitStack.js"]
    concatenated_filename = "javascripts/solitaire/solitaire-all.js"
    
    #remove old files, create blank ones again
    File.delete(concatenated_filename) and puts "Deleted old file" if File.exists?(concatenated_filename)
    FileUtils.touch(concatenated_filename)
    
    file = File.open(concatenated_filename, 'w') do |f|
      files.each do |i|
        f.puts(IO.read("javascripts/solitaire/#{i}"))
        f.puts("\n")
      end
    end
  end
  
  desc "Minifies a JS file using YUI Compressor"
  task :minify do
    minified_filename = "javascripts/solitaire/solitaire-min.js"
    FileUtils.rm(minified_filename) if File.exists?(minified_filename)
    
    system("java -jar ../yui-compressor/build/yuicompressor-2.4.jar javascripts/solitaire/solitaire-all.js -o #{minified_filename}")
  end
  
  desc "Prepares site for deployment (concatenates and minifies js code)"
  task :deploy do
    Rake::Task["solitaire:concatenate"].execute
    Rake::Task["solitaire:minify"].execute
  end
  
end