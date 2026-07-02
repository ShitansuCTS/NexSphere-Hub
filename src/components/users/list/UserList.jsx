"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "react-hot-toast";

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const FetchData = async () => {
      try {
        const response = await fetch("/api/v1/contacts?page=1&limit=10");
        const data = await response.json();
        setUsers(data.data || []);
        console.log("Fetched Data:", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    FetchData();
  }, []);

  const deleteUser = () => {
    toast.success("Action not implemented yet !");
  };

  return (
    <div className="card basic-data-table">
      <div className="card-header">
        <h5 className="card-title mb-0">Default Data Tables</h5>
      </div>
      <div className="card-body">
        <table
          className="table bordered-table mb-0"
          id="dataTable"
          data-page-length={10}
        >
          <thead>
            <tr>
              <th scope="col">
                <div className="form-check style-check d-flex align-items-center">
                  <label className="form-check-label">S.L</label>
                </div>
              </th>
              <th scope="col">Name</th>
              <th scope="col">Issued Date</th>
              <th scope="col">Mobile</th>
              <th scope="col" className="dt-orderable-asc dt-orderable-desc">
                Block & Nac's
              </th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>
                  <div className="form-check style-check d-flex align-items-center">
                    <label className="form-check-label"> {index + 1}</label>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <img
                      src="/assets/images/avatar1.png"
                      alt=""
                      className="flex-shrink-0 me-12 radius-8"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <h6 className="text-md mb-0 fw-medium flex-grow-1">
                      {user.name}
                    </h6>
                  </div>
                </td>
                <td>
                  {" "}
                  {new Date(user.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td>{user.mobile}</td>
                <td>
                  {" "}
                  <span className="bg-success-focus text-success-main px-24 py-4 rounded-pill fw-medium text-sm">
                    {user.block?.name || user.nac?.name}
                  </span>
                </td>
                <td>
                  <Link
                    href="#"
                    className="w-32-px h-32-px me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center"
                  >
                    <Icon icon="iconamoon:eye-light" />
                  </Link>
                  <Link
                    href="#"
                    className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                  >
                    <Icon icon="lucide:edit" />
                  </Link>
                  <Link
                    href="#"
                    onClick={deleteUser}
                    className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                  >
                    <Icon icon="mingcute:delete-2-line" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
