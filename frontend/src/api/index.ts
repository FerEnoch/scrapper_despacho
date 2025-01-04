const API_BASE_URL = import.meta.env.VITE_FILES_API_URL;

export const api = {
  getFilesStats: async (formData: FormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.log("🚀 ~ getFilesStats ~ error:", error);
    }
  },

  uploadFile: async (formData: FormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/end`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
    }
  },

  endFileyId: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/end/${id}`);

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.log("🚀 ~ endFileyId ~ error:", error);
    }
  },
};
