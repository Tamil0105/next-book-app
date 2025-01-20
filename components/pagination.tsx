import React from 'react';
import { Pagination, Select } from 'antd';

const { Option } = Select;

interface MyPaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
}

const MyPagination: React.FC<MyPaginationProps> = ({ page, totalPages, setPage, limit, setLimit }) => {
  return (
    <div className="flex justify-between mb-4">
      <Pagination
        current={page}
        total={totalPages * limit} // Assuming totalPages is the total number of items
        onChange={(page) => setPage(page)}
        pageSize={limit}
        showSizeChanger={false} // Hide the page size changer
        showQuickJumper // Allow quick jumping to a page
      />
      <Select
        value={limit}
        onChange={(value) => setLimit(value as number)} // Cast value to number
        className="ml-4"
        style={{ width: 100 }}
      >
        <Option value={5}>5</Option>
        <Option value={10}>10</Option>
        <Option value={15}>15</Option>
      </Select>
    </div>
  );
};

export default MyPagination;