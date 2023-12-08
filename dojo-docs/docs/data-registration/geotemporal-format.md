---
layout: default
title: Geotemporal Format
parent: Data Registration
---

## Geotemporal Format

Dojo will optionally convert model data into the Geotemporal format used in several applications.

### Contents

This document is will further describe the Geotemporal format and elaborate on some less common data registration scenarios.

1. [Overview](#overview)
2. [Date ranges](#date-ranges)
3. [Non-standard calendars](#non-standard-calendars)
4. [Reserved column names](#reserved-column-names)

### Overview

The Geotemporal format is a tabular data representation that is stored as gzipped parquet. Data will have a fixed set of columns plus arbitrary `qualifier` columns:

| timestamp  | country  | admin1 | admin2      | admin3 | lat      | lng      | feature  | value | qualifier_1 |
|------------|----------|--------|-------------|--------|----------|----------|----------|-------|-------------|
| 1546318800 | Ethiopia | Afar   | Afar Zone 3 | Gewane | 10.16807 | 40.64634 | feature1 | 1     |             |
| 1561953600 | Ethiopia | Afar   | Afar Zone 3 | Gewane | 10.16807 | 40.64634 | feature1 | 2     |             |
| 1577854800 | Ethiopia | Afar   | Afar Zone 3 | Gewane | 10.16807 | 40.64634 | feature1 | 3     |             |
| 1546318800 | Ethiopia | Afar   | Afar Zone 3 | Gewane | 10.16807 | 40.64634 | feature2 | 100   | maize       |
| 1561953600 | Ethiopia | Afar   | Afar Zone 3 | Gewane | 10.16807 | 40.64634 | feature2 | 90    | maize       |
| 1577854800 | Ethiopia | Afar   | Afar Zone 3 | Gewane | 10.16807 | 40.64634 | feature2 | 80    | maize       |

The fixed columns are `[timestamp, country, admin1, admin2, admin3, lat, lng, feature, value]`. Here `qualifier_1` is the name of the qualifier which qualifies `feature2`. Note that the fixed columns are nullable, but data that does not have at least some notion of time or place is not particularly useful.

Converting indicator datasets and model output is **THE GOAL** of the Dojo data pipeline. The above example is meant to illuminate in more detail the **target** format, but model output and indicator datasets are not expected to start in this format. 

This example is available in [gzipped parquet here](../data/geotemporal_example_format.parquet.gzip).

### Date ranges

In some instances a model may have date data that represents a range of dates for example:

|    Date   | Country  | Crop Index |
|-----------|----------|------------|
| 2015/2016 | Djibouti | 0.7        |
| 2016/2017 | Djibouti | 0.8        |
| 2017/2018 | Djibouti | 0.9        |

 where `2017/2018` represents start and end dates. The Geotemporal format supports only a single date field with the column name `timestamp`, therefore a multi-date should be divided into separate columns. Using the above example, this would correspond to:

| Start Date | End Date  | Country  | Crop Index |
|------------|-----------|----------|------------|
|    2015    |    2016   | Djibouti | 0.7        |
|    2016    |    2017   | Djibouti | 0.8        |
|    2017    |    2018   | Djibouti | 0.9        |

where one date would be marked as the `primary_date = True` and another would become a `feature` or `qualifier` column, as described in the [data registration document](../data-registration).

By convention, we expect that date ranges are represented by the first date of that range. For example, a date point representing the entire month of May, 2020 could be presented as `5/1/2020`. Alternatively, Dojo provides a mechanism for the user to "build a date" where `month` and `year` are in separate columns and there is no `day` column.


### Non-standard calendars

Dates are standardized according to the [Gregorion calendar](https://en.wikipedia.org/wiki/Gregorian_calendar). An example of a non-standard calendar is the [Ethiopian calendar](https://en.wikipedia.org/wiki/Ethiopian_calendar). Dates in a non-standard calendar should be converted to Gregorion datetime.


### Reserved column names
The Geotemporal format reserves the following column names: `timestamp`, `country`, `admin1`, `admin2`, `admin3`, `lat`, `lng`, `feature`, and `value`. If data is submitted with these column names and not used to represent that entity, then the submitted column name will be appended with the suffix `_non_primary`.
