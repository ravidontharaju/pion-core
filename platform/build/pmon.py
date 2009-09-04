#!/usr/bin/python
# --------------------------
# pion server monitor script
# --------------------------

import pget, time


def main():
	# parse command-line options
	parser = pget.get_arg_parser()
	parser.add_option("-i", "--interval", action="store", type="int", default="10",
		help="interval of time (in seconds) between Pion statistics requests")
	options, arguments = parser.parse_args()		
	# argument sanity check
	if (options.interval < 1):
		options.interval = 1
	# establish connection to Pion server
	con = pget.get_con(options)
	headers = {'Cookie' : 'pion_session_id="' + options.cookie + '"'}
	# main loop
	while (True):
		# retrieve and display stats from Pion server
		r = pget.get_response(con, '/query/reactors', headers)
		pget.print_response(r)
		# sleep a bit
		time.sleep(options.interval)
	# close the HTTP connection
	con.close()


# call main() if script is being executed	
if __name__ == '__main__':
	main()

