import React, { useEffect, useState } from "react";
import {
  TimePicker,
  DatePicker,
  Button,
  List,
  Typography,
  Row,
  Col,
  Switch,
  Spin,
  message,
  Input,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface BlockedDays {
  id: number;
  timeRanges: { start: string; end: string }[];
  isWeekendDisabled: boolean;
  blockedDays: string[];
  dateRange: { start: string; end: string };
  name: string;
  email: string;
  password: string;
  turfOptions: string[];
}

const ManageBlockedDays: React.FC = () => {
  const [newBlockedDays, setNewBlockedDays] = useState<string[]>([]);
  const [newTimeRange, setNewTimeRange] = useState<[Dayjs, Dayjs]>([
    dayjs(),
    dayjs(),
  ]);
  const [disableWeekends, setDisableWeekends] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [blockedDaysConfig, setBlockedDaysConfig] = useState<BlockedDays>({
    id: 0,
    timeRanges: [],
    isWeekendDisabled: true,
    blockedDays: [],
    dateRange: {
      start: dayjs().subtract(7, "day").toISOString(),
      end: dayjs().toISOString(),
    },
    name: "",
    password: "",
    email: "",
    turfOptions: [], // Ensure this is initialized as an empty array
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [newTurfOption, setNewTurfOption] = useState<string>(""); // New state for turf option input

  useEffect(() => {
    const fetchBlockedDays = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/db/manage-days");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setBlockedDaysConfig({
          ...data[0],
          turfOptions: data[0]?.turfOptions || [], // Ensure turfOptions is an array
        });
        setDisableWeekends(data[0]?.isWeekendDisabled || false);
      } catch (error) {
        console.error("Error fetching blocked days:", error);
        alert("Failed to fetch blocked days.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlockedDays();
  }, []);

  const updateBlockedDaysConfig = async (updatedConfig: BlockedDays) => {
    setLoading(true);
    const method = updatedConfig.id > 0 ? "PUT" : "POST";
    try {
      const response = await fetch("/api/db/manage-days", {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      setBlockedDaysConfig(updatedConfig);
      message.success("Blocked days configuration updated successfully.");
    } catch (error) {
      console.error("Error updating blocked days config:", error);
      message.error("Failed to update blocked days configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeRange = async () => {
    if (newTimeRange[0] && newTimeRange[1]) {
      const updatedConfig = {
        ...blockedDaysConfig,
        timeRanges: [
          ...blockedDaysConfig.timeRanges,
          {
            start: newTimeRange[0].toISOString(),
            end: newTimeRange[1].toISOString(),
          },
        ],
      };
      await updateBlockedDaysConfig(updatedConfig);
      setNewTimeRange([dayjs(), dayjs()]);
    }
  };

  const handleRemoveTimeRange = async (index: number) => {
    const updatedConfig = {
      ...blockedDaysConfig,
      timeRanges: blockedDaysConfig.timeRanges.filter((_, i) => i !== index),
    };
    await updateBlockedDaysConfig(updatedConfig);
  };

  const handleBlockDays = async () => {
    const updatedConfig = {
      ...blockedDaysConfig,
      blockedDays: [...blockedDaysConfig.blockedDays, ...newBlockedDays],
    };
    await updateBlockedDaysConfig(updatedConfig);
    setNewBlockedDays([]);
  };

  const handleRemoveBlockedDay = async (day: string) => {
    const updatedBlockedDays = blockedDaysConfig.blockedDays.filter(
      (bd) => bd !== day
    );
    const updatedConfig = {
      ...blockedDaysConfig,
      blockedDays: updatedBlockedDays,
    };
    await updateBlockedDaysConfig(updatedConfig);
  };

  const handleDateRangeChange = async (dates: [Dayjs, Dayjs]) => {
    if (dates && dates.length === 2) {
      const updatedConfig = {
        ...blockedDaysConfig,
        dateRange: {
          start: dates[0].toISOString(),
          end: dates[1].toISOString(),
        },
      };
      await updateBlockedDaysConfig(updatedConfig);
    }
  };

  const handleWeekendToggle = async (checked: boolean) => {
    const updatedConfig = {
      ...blockedDaysConfig,
      isWeekendDisabled: checked,
    };
    await updateBlockedDaysConfig(updatedConfig);
    setDisableWeekends(checked);
  };

  const disableDate = (current: Dayjs) => {
    return disableWeekends && (current.day() === 0 || current.day() === 6);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlockedDaysConfig({ ...blockedDaysConfig, name: e.target.value });
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlockedDaysConfig({ ...blockedDaysConfig, email: e.target.value });
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlockedDaysConfig({ ...blockedDaysConfig, password: e.target.value });
  };

  const handleAddTurfOption = async () => {
    if (newTurfOption.trim()) {
      // Check if the input is not empty
      const updatedTurfOptions = [
        ...blockedDaysConfig.turfOptions,
        newTurfOption.trim(), // Trim whitespace
      ];
      const updatedConfig = {
        ...blockedDaysConfig,
        turfOptions: updatedTurfOptions,
      };
      await updateBlockedDaysConfig(updatedConfig);
      setNewTurfOption(""); // Clear the input after adding
    } else {
      message.warning("Turf option cannot be empty."); // Show warning if empty
    }
  };

  const handleRemoveTurfOption = async (option: string) => {
    const updatedTurfOptions = blockedDaysConfig.turfOptions.filter(
      (turf) => turf !== option
    );
    const updatedConfig = {
      ...blockedDaysConfig,
      turfOptions: updatedTurfOptions,
    };
    await updateBlockedDaysConfig(updatedConfig);
  };
  const validateUserDetails = () => {
    const { name, email, password } = blockedDaysConfig;
    let isValid = true;

    // Reset error messages
    setUsernameError("");
    setEmailError("");
    setPasswordError("");

    if (!name || name.length < 3) {
      isValid = false;
      setUsernameError("Username must be at least 3 characters long.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      isValid = false;
      setEmailError("Please enter a valid email address.");
    }

    if (!password || password.length < 6) {
      isValid = false;
      setPasswordError("Password must be at least 6 characters long.");
    }

    return isValid;
  };

  const handleSaveUserDetails = async () => {
    const isValid = validateUserDetails();

    if (!isValid) {
      return; // Stop execution if validation fails
    }

    setLoading(true);
    const updatedConfig = {
      ...blockedDaysConfig,
    };
    await updateBlockedDaysConfig(updatedConfig);
    setLoading(false);
  };
  return (
    <div className="mt-6 bg-white shadow-md rounded-lg p-6 ">
      <Typography.Title level={2} className="mb-4">
        Manage Blocked Days
      </Typography.Title>

      {loading ? (
        <div className="flex justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center py-3">
            <span className="flex gap-3 justify-center">
              <Typography.Title level={5}>Week End</Typography.Title>
              <Switch
                checked={disableWeekends}
                onChange={handleWeekendToggle}
                size="default"
                checkedChildren="Disable"
                unCheckedChildren="Enable"
              />
            </span>

            <span className="flex gap-3 justify-center">
              <Typography.Title level={5}>Date Range</Typography.Title>
              <DatePicker.RangePicker
                format="YYYY-MM-DD"
                disabledDate={disableDate}
                //@ts-ignore
                onChange={handleDateRangeChange}
                placeholder={["Start Date", "End Date"]}
                value={[
                  dayjs(blockedDaysConfig.dateRange.start),
                  dayjs(blockedDaysConfig.dateRange.end),
                ]}
              />
            </span>
          </div>

          <Row gutter={16} className="mb-4">
            <Col span={12}>
              <TimePicker.RangePicker
                value={newTimeRange}
                onChange={(time) => {
                  if (time) {
                    setNewTimeRange(time as [Dayjs, Dayjs]);
                  }
                }}
                format="HH:mm"
                style={{ width: "100%" }}
              />
              <Button
                type="primary"
                onClick={handleAddTimeRange}
                className="mt-2"
              >
                Add Time Range
              </Button>
            </Col>

            <Col span={12}>
              <DatePicker
              multiple
                value={
                  newBlockedDays.length > 0
                    ? newBlockedDays.map((day) => dayjs(day))
                    : ''
                }
                onChange={(dates, dateStrings) => {
                  console.log(dates)
                  setNewBlockedDays(dateStrings as string[]);
                }}
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
              />
              <Button type="primary" onClick={handleBlockDays} className="mt-2">
                Add Days
              </Button>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Typography.Title level={4} className="mb-2">
                Selected Time Ranges
              </Typography.Title>
              <List
                bordered
                dataSource={blockedDaysConfig.timeRanges.map(
                  (range, index) => ({
                    key: index,
                    text: `${dayjs(range.start)
                      .tz("Asia/Kolkata")
                      .format("hh:mm A")} - ${dayjs(range.end)
                      .tz("Asia/Kolkata")
                      .format("hh:mm A")}`,
                  })
                )}
                renderItem={(item, index) => (
                  <List.Item>
                    <Typography.Text>{item.text}</Typography.Text>
                    <Button
                      type="link"
                      danger
                      onClick={() => handleRemoveTimeRange(index)}
                    >
                      Remove
                    </Button>
                  </List.Item>
                )}
              />
            </Col>

            <Col span={12}>
              <Typography.Title level={4} className="mb-2">
                Blocked Days
              </Typography.Title>
              <List
                bordered
                dataSource={blockedDaysConfig.blockedDays}
                renderItem={(day) => (
                  <List.Item>
                    <Typography.Text>{day}</Typography.Text>
                    <Button
                      type="link"
                      danger
                      onClick={() => handleRemoveBlockedDay(day)}
                    >
                      Remove
                    </Button>
                  </List.Item>
                )}
              />
            </Col>
          </Row>
          <div className="flex  justify-start  gap-3">
            <div className="w-full md:w-[50%]">
              <div className="w-full flex justify-start mt-1 items-start flex-col">
                <Typography.Title level={5}>User Details</Typography.Title>

                <Input
                  placeholder="Username"
                  value={blockedDaysConfig.name}
                  onChange={handleUsernameChange}
                  className="mb-2"
                />
                {usernameError && (
                  <Typography.Text type="danger">
                    {usernameError}
                  </Typography.Text>
                )}

                <Input
                  placeholder="Email"
                  value={blockedDaysConfig.email}
                  onChange={handleEmailChange}
                  className="mb-2"
                />
                {emailError && (
                  <Typography.Text type="danger">{emailError}</Typography.Text>
                )}

                <Input.Password
                  placeholder="Password"
                  value={blockedDaysConfig.password}
                  onChange={handlePasswordChange}
                  className="mb-2"
                />
                {passwordError && (
                  <Typography.Text type="danger">
                    {passwordError}
                  </Typography.Text>
                )}

                <Button
                  type="primary"
                  onClick={handleSaveUserDetails}
                  className="mb-2"
                >
                  Save User Details
                </Button>
              </div>
              <div>
                <Typography.Title level={5}>Turf Options</Typography.Title>
                <Input
                  placeholder="Add Turf Option"
                  value={newTurfOption}
                  onChange={(e) => setNewTurfOption(e.target.value)}
                  className="mb-2"
                />
                <Button
                  type="primary"
                  onClick={handleAddTurfOption}
                  className="mb-2"
                >
                  Add Turf Option
                </Button>
                <List
                  bordered
                  dataSource={
                    blockedDaysConfig.turfOptions.length > 0
                      ? blockedDaysConfig.turfOptions
                      : ["No Turf Options Available"]
                  }
                  renderItem={(option) => (
                    <List.Item>
                      <Typography.Text>{option}</Typography.Text>
                      {option !== "No Turf Options Available" && (
                        <Button
                          type="link"
                          danger
                          onClick={() => handleRemoveTurfOption(option)}
                        >
                          Remove
                        </Button>
                      )}
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageBlockedDays;
