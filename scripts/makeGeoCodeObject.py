import csv

pathToCSV = 'data/csv/geocoded-meters-2018-01-24.csv'
latColumn = 'LATITUDE'
longColumn = 'LONGITUDE'
meterColumn = 'METER_ID'

def main():
    geocodes = {}
    with open(pathToCSV) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            geocodes[str(row[meterColumn])] = {'lat': row[latColumn], 'long': row[longColumn] }

    print "var geocodes = function() {"
    print "\treturn " + str(geocodes) + ";"
    print "}"


if __name__ == "__main__":
    main()
