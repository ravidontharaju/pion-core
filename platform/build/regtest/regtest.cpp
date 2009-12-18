#include <iostream>
#include <fstream>
#include <string>
#include <vector>
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
	if (argc != 3 && argc != 4)
		fatal(1, "Usage", string(argv[0]) + " [-l] <regex-file> <data-file>\n"
			"\t-s = treat data-file as a list of single-line inputs");
	bool list = string(argv[1]) == "-l";
	char *rf = argv[list ? 2 : 1], *df = argv[list ? 3 : 2];
	vector<string> rspecs, rfrmts, dlines;

	ifstream rfile(rf);
	if (!rfile.good()) fatal(2, "ERROR", string("Cannot access ") + rf);
	int ri = 0;
	string rtmp1, rtmp2;
	do {
		getline(rfile, rtmp1); getline(rfile, rtmp2);
		if (rfile.eof()) break;
		if (rtmp1[0] != 'P' && rtmp1[0] != 'R' && rtmp1[0] != 'S')
			fatal(3, "ERROR", string("Bad regex specifier"));
		rspecs.push_back(rtmp1); rfrmts.push_back(rtmp2);
		ri++;
	} while (rfile.good());

	ifstream dfile(df);
	if (!dfile.good()) fatal(3, "ERROR", string("Cannot access ") + df);
	int di = 0;
	string dtmp;
	do {
		getline(dfile, dtmp);
		if (dfile.eof()) break;
		dlines.push_back(dtmp);
		di++;
	} while (dfile.good());

	if (list) {
		string data;
		for (int dj = 0; dj < di; dj++) {
			if (!data.empty()) data += "\n";
			data += dlines[dj];
		}
		dlines.assign(di = 1, data);
	}

	for (int rj = 0; rj < ri; rj++) {
		string regexp = rspecs[rj].substr(1);
		if (rj > 0) cout << string(40, '=') << endl;
		cout << rspecs[rj][0] << "REGEX[" << rj << "]: " << regexp << endl;
		cout << "XMLREG[" << rj << "]: " << xml_encode(regexp) << endl;
		cout << "FORMAT[" << rj << "]: " << rfrmts[rj] << endl;
		cout << "XMLFMT[" << rj << "]: " << xml_encode(rfrmts[rj]) << endl;
		cout << "RESULT[" << rj << "]: ";
		try {
			regex rx(regexp);
			cout << "Valid Regex" << endl;
			for (int dj = 0; dj < di; dj++) {
				if (rspecs[rj][0] == 'P') {
					match_results<string::const_iterator> mr;
					if (regex_search(dlines[dj], mr, rx))
						dlines[dj] = mr.format(rfrmts[rj], boost::format_all);
					else // MATCH FAILED
						dlines[dj] = "";
				} else {
					string res = regex_replace(dlines[dj], rx, rfrmts[rj],
						boost::format_all | boost::format_no_copy);
					if (!res.empty())
						dlines[dj] = res;
					else // EMPTY RESULT
						if (rspecs[rj][0] == 'R') dlines[dj] = res;
				}
				cout << dlines[dj] << endl;
			}
		} catch (...) {
			cout << "EXCEPTION!" << endl;
			break;
		}
	}
}
