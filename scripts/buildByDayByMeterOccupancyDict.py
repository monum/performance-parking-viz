import csv
import numpy

from datetime import datetime
from datetime import timedelta

PATHTOCSV = 'data/csv/seaport_occupancy_by_meter_by_day.csv'
ROWS = ['date', 'meter', 'occupancy']
STARTDATE = '2017-01-03'
ENDDATE = '2017-12-30'


def _initializeDateDict(startdate, enddate):
    """Builds dictionary that will hold the data, keyed by date for the seaport occupancy viz."""
    start = datetime.strptime(startdate, '%Y-%m-%d')
    end = datetime.strptime(enddate, '%Y-%m-%d')
    current = start

    occupancy_dict = {}

    while current <= end:
        occupancy_dict[current.strftime('%Y-%m-%d')] = []
        current = current + timedelta(days=1)

    return occupancy_dict


def buildDateDict():
    occupancy_dict = _initializeDict(STARTDATE, ENDDATE)

    with open(PATHTOCSV) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
           occupancy_dict[row['date']].append(row)

    print "var occupancyByDate = function() {"
    print "\treturn " + str(occupancy_dict) + ";"
    print "}"


def merge_two_dicts(x, y):
    z = x.copy()   # start with x's keys and values
    z.update(y)    # modifies z with y's keys and values & returns None
    return z

def buildMeterDict():
    occupancy_dict = {}

    with open(PATHTOCSV) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                meterOccupancy = occupancy_dict[row['meter']]
            except KeyError:
                meterOccupancy = {}

            meterOccupancy = merge_two_dicts(meterOccupancy, {row['date'] : row['occupancy']})
            occupancy_dict[row['meter']] = meterOccupancy

    print "var occupancyByMeter = function() {"
    print "\treturn " + str(occupancy_dict) + ";"
    print "}"


def buildDates():
    dates = []
    start = datetime.strptime(STARTDATE, '%Y-%m-%d')
    end = datetime.strptime(ENDDATE, '%Y-%m-%d')
    current = start

    while current <= end:
        dates.append(current.strftime('%Y-%m-%d'))
        current = current + timedelta(days=1)

    print "var dates = function() {"
    print "\treturn " + str(dates) + ";"
    print "}"

def buildMeters():
    dates = []
    start = datetime.strptime(STARTDATE, '%Y-%m-%d')
    end = datetime.strptime(ENDDATE, '%Y-%m-%d')
    current = start

    while current <= end:
        dates.append(current.strftime('%Y-%m-%d'))
        current = current + timedelta(days=1)

    print "var dates = function() {"
    print "\treturn " + str(dates) + ";"
    print "}"


def buildMeterIds():
    ids = []

    with open(PATHTOCSV) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            ids.append(row['meter'])

    unique = list(set(ids))
    unique.sort()
    print "var meterIds = function() {"
    print "\treturn " + str(unique) + ";"
    print "}"


def buildAggregateOccupancies():
    monthDictionary = {}
    for i in range(1, 13):
        monthDictionary[str(i)] = {
            'total_hour_capacity': [],
            'occupancy': [],
            'average_session_length': []
        }

    with open(PATHTOCSV) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            date = datetime.strptime(row['date'], '%Y-%m-%d')

            monthDictionary[str(date.month)]['total_hour_capacity'].append(float(row['total_hour_capacity']))
            monthDictionary[str(date.month)]['occupancy'].append(float(row['occupancy']))
            try:
                monthDictionary[str(date.month)]['average_session_length'].append(float(row['sum_vehicle_hours'])/float(row['total_sessions']))

            except ZeroDivisionError:
                if float(row['sum_vehicle_hours']) == 0.0 and float(row['total_sessions']) == 0.0:
                    monthDictionary[str(date.month)]['average_session_length'].append(0.0)

    averages = {}
    for monthKey in monthDictionary.keys():
        all_month_flat_entry = monthDictionary[monthKey]
        this_month_aggregate_entry = {}
        for key in all_month_flat_entry.keys():
            try:
                average = sum(all_month_flat_entry[key])/float(len(all_month_flat_entry[key]))
            except ZeroDivisionError:
                if sum(all_month_flat_entry[key]) == 0.0 and float(len(all_month_flat_entry[key])) == 0.0:
                    average = 0.0
            this_month_aggregate_entry[key] = average

        averages[monthKey] = this_month_aggregate_entry

    print "var aggregateMonthData = function() {"
    print "\treturn " + str(averages) + ";"
    print "}"


if __name__ == "__main__":
    #buildDict()
    #buildMeterDict()
    #buildDates()
    #buildMeters()
    #buildMeterIds()
    buildAggregateOccupancies()
