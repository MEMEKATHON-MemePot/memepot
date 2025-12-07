// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library UtilHelper {
    uint256 internal constant SECONDS_PER_DAY = 1 days;

    /// @notice 내일 00:00 (UTC) 타임스탬프
    function getNextDayMidnight(uint256 timestamp) internal pure returns (uint256) {
        uint256 currentDayStart = (timestamp / SECONDS_PER_DAY) * SECONDS_PER_DAY;
        return currentDayStart + SECONDS_PER_DAY;
    }

    /// @notice 다음 월요일 00:00 (UTC) 타임스탬프
    function getNextMondayMidnight(uint256 timestamp) internal pure returns (uint256) {
        uint256 currentDayStart = (timestamp / SECONDS_PER_DAY) * SECONDS_PER_DAY;

        // 1970-01-01(목) 기준 오프셋: 0=일,1=월,...6=토
        uint256 dayOfWeek = ((currentDayStart / SECONDS_PER_DAY) + 4) % 7;

        uint256 daysUntilMonday;
        if (dayOfWeek == 0) {
            daysUntilMonday = 1; // 일요일 → 내일(월요일)
        } else if (dayOfWeek == 1) {
            daysUntilMonday = 7; // 월요일 → 다음 주 월요일
        } else {
            daysUntilMonday = 8 - dayOfWeek; // 화~토
        }

        return currentDayStart + daysUntilMonday * SECONDS_PER_DAY;
    }

    /// @notice 다음달 1일 00:00 (UTC) 타임스탬프
    function getNextMonthFirst(uint256 timestamp) internal pure returns (uint256) {
        (uint256 year, uint256 month, ) = timestampToDate(timestamp);

        if (month == 12) {
            month = 1;
            year += 1;
        } else {
            month += 1;
        }

        return dateToTimestamp(year, month, 1);
    }

    /// @notice timestamp → (year, month, day)  (UTC 기준)
    function timestampToDate(uint256 timestamp) internal pure returns (uint256 year, uint256 month, uint256 day) {
        uint256 daysSinceEpoch = timestamp / SECONDS_PER_DAY;

        uint256 z = daysSinceEpoch + 719468;
        uint256 era = z / 146097;
        uint256 doe = z - era * 146097;
        uint256 yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
        year = yoe + era * 400;
        uint256 doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
        uint256 mp = (5 * doy + 2) / 153;
        day = doy - (153 * mp + 2) / 5 + 1;
        month = mp + (mp < 10 ? 3 : 0) - 9;
        year += (month <= 2 ? 1 : 0);
    }

    /// @notice (year, month, day) → timestamp (해당일 00:00:00 UTC)
    function dateToTimestamp(uint256 year, uint256 month, uint256 day) internal pure returns (uint256) {
        require(month >= 1 && month <= 12, "UtilHelper: Invalid month");
        require(day >= 1 && day <= 31, "UtilHelper: Invalid day");

        int256 _year = int256(year);
        int256 _month = int256(month);
        int256 _day = int256(day);

        _year -= (_month <= 2 ? int256(1) : int256(0));
        _month += (_month <= 2 ? int256(12) : int256(0));

        int256 era = _year / 400;
        int256 yoe = _year - era * 400;
        int256 doy = (_month * 153 + 3) / 5 + _day - 1;
        int256 doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;

        int256 daysSinceEpoch = era * 146097 + doe - 719468;

        return uint256(daysSinceEpoch) * SECONDS_PER_DAY;
    }
}
