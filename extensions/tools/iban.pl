#!/usr/bin/perl
use strict;
use LWP::UserAgent;

# parametro de entrada
my  $ua = LWP::UserAgent->new(agent => '');
my $remot_page = 'http://en.wikipedia.org/wiki/International_Bank_Account_Number';
my $response = $ua->get($remot_page);
$response->is_success || die $response->status_line;

my $html = $response->decoded_content;
open FILE, ">iban.xhtml";  
print FILE $html;
exit;


