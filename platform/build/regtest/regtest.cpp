#include <iostream>
#include <fstream>
#include <string>
#include "boost/regex.hpp"

using namespace std;
using namespace boost;

static string xml_encode(const string& str)
{
	string result;
	for (string::size_type pos = 0; pos < str.size(); ++pos) {
		switch (str[pos]) {
			case '&':
				result += "&amp;";
				break;
			case '<':
				result += "&lt;";
				break;
			case '>':
				result += "&gt;";
				break;
/*
			case '\"':
				result += "&quot;";
				break;
			case '\'':
				result += "&apos;";
				break;
*/
			default:
				result += str[pos];
		}
	}
	return result;
}

static void fatal(int rc, string type, string msg)
{
	cout << type << ": " << msg << endl;
	exit(rc);
}

int main(int argc, char *argv[])
{
	if (argc != 3) fatal(1, "Usage", string(argv[0]) + " <regex-file> <data-file>");

	ifstream rfile(argv[1]);
	if (!rfile.good()) fatal(2, "ERROR", string("Cannot access ") + argv[1]);
	string spec[50], format[50];
	int i = 0;
	while (i < 50 && rfile.good()) {
		getline(rfile, spec[i]);
		if (rfile.eof()) break;
		if (spec[i][0] != 'P' && spec[i][0] != 'R' && spec[i][0] != 'S')
			fatal(3, "ERROR", string("Bad regex specifier"));
		getline(rfile, format[i]);
		i++;
	}

	ifstream dfile(argv[2]);
	if (!dfile.good()) fatal(3, "ERROR", string("Cannot access ") + argv[2]);
	string data, tmp;
	while (dfile.good()) {
		getline(dfile, tmp);
		data += tmp + "\n";
	}

	regex rx;
	for (int j = 0; j < i; j++) {
		string regexp = spec[j].substr(1);
		if (j > 0) cout << string(40, '=') << endl;
		cout << spec[j][0] << "REGEX[" << j << "]: " << regexp << endl;
		cout << "XMLREG[" << j << "]: " << xml_encode(regexp) << endl;
		cout << "FORMAT[" << j << "]: " << format[j] << endl;
		cout << "XMLFMT[" << j << "]: " << xml_encode(format[j]) << endl;
		cout << "RESULT[" << j << "]:";
		try {
			rx = regexp;
			if (spec[j][0] == 'P') {
				match_results<string::const_iterator> mr;
				if (regex_search(data, mr, rx))
					data = mr.format(format[j], boost::format_all);
				else {
					cout << " MATCH FAILED!";
					data = "";
				}
			} else {
				string res = regex_replace(data, rx, format[j], boost::format_all | boost::format_no_copy);
				if (res.empty()) {
					cout << " EMPTY RESULT!";
					if (spec[j][0] == 'R') data = res;
				} else
					data = res;
			}
		} catch (...) {
			cout << " EXCEPTION!" << endl;
			break;
		}
		cout << endl;
		if (!data.empty()) cout << data << endl;
	}
}
