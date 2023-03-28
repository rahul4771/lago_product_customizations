import { TOKEN } from "../constants/common.js";

const get = async (url, signal = null) => {
  try {
    let request = {
      method: "GET",
      headers: {
        "access-token": TOKEN,
      }
    };
    if (signal != null) {
      request['signal'] = signal;
    }
    const response = await fetch(url, request);
    return response.json();
  } catch (e) {
  }
}

const post = async (url, data = {}, signal = null) => {
  try {
    let request = {
      method: "POST",
      headers: {
        "access-token": TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    };
    if (signal != null) {
      request['signal'] = signal;
    }
    const response = await fetch(url, request);
    return response.json();
  } catch (e) {
  }
}

const postFormData = async (url, formData) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "access-token": TOKEN,
      },
      body: formData,
    });
    return response.json();
  } catch (e) {
  }
}

const put = async (url, data = {}) => {
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "access-token": TOKEN,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (e) {
  }
}

const delet = async (url, data = {}) => {
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "access-token": TOKEN,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (e) {
  }
}

export default {
  get,
  post,
  postFormData,
  put,
  delet,
};
