#!/usr/bin/perl
use strict;
use CGI::Fast  qw(:standard);
use CGI::Carp 'fatalsToBrowser';
use JSON;
use Data::Dumper;

$CGI::POST_MAX=1024 * 5;  # max 5K posts
$CGI::DISABLE_UPLOADS = 1;  # no uploads

$\ = "\n";
$, = ",";

my $json = JSON->new->utf8;

open REPORT,">>./report.txt";
sub getTime{
	my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime(time);
	return sprintf "%4d-%02d-%02dT%02d:%02d:%02d",$year+1900,$mon+1,$mday,$hour,$min,$sec;
}
while (my $q = new CGI::Fast) {
	print $q->header();
	#my @names = $q->param;
	my $report = $q->param('report');
	next unless $report;
	my $browser = $json->decode($report);
	my $data = {
		browser => $browser,
		host => remote_host(),
		addr => remote_addr(),
		referer => referer(),
		time => getTime,
	};
	$data->{vote} = $q->param('vote') if defined $q->param('vote');
	print REPORT $json->encode($data);
}


