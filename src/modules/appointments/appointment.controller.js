import * as appointmentService from "./appointment.service.js";
import {
  notifyAppointmentBooked,
  notifyAppointmentCancelled,
  notifyAppointmentCompleted,
} from "../../services/notification.service.js";
import logger from "../../utils/logger.js";

/**
 * Book an appointment
 * POST /appointments
 */
export const bookAppointmentHandler = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { time_slot_id } = req.body;

    // Verify user is a client
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can book appointments",
      });
    }

    const appointment = await appointmentService.bookAppointment(
      clientId,
      time_slot_id,
    );

    // Send real-time notifications
    notifyAppointmentBooked({
      id: appointment.id,
      client_id: appointment.client_id,
      provider_user_id: appointment.provider_user_id,
      slot: {
        slot_date: appointment.slot_date,
        start_time: appointment.start_time,
        duration: appointment.duration,
      },
      client: {
        name: appointment.client_name,
        email: appointment.client_email,
      },
      provider: {
        name: appointment.provider_name,
        specialization: appointment.specialization,
      },
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: {
        id: appointment.id,
        client_id: appointment.client_id,
        provider_id: appointment.provider_id,
        time_slot_id: appointment.time_slot_id,
        status: appointment.status,
        slot_date: appointment.slot_date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        duration: appointment.duration,
        provider: {
          name: appointment.provider_name,
          specialization: appointment.specialization,
        },
        created_at: appointment.created_at,
      },
    });
  } catch (error) {
    logger.error("Error in bookAppointmentHandler:", error);

    if (
      error.message.includes("not found") ||
      error.message.includes("already booked") ||
      error.message.includes("already exists")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

/**
 * Get appointments for the authenticated user
 * GET /appointments/my-appointments
 */
export const getMyAppointmentsHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.query;

    let appointments;

    if (userRole === "client") {
      appointments = await appointmentService.getClientAppointments(
        userId,
        status,
      );
    } else if (userRole === "provider") {
      // Get provider_id from service_providers table
      const pool = (await import("../../config/database.js")).default;
      const providerResult = await pool.query(
        "SELECT id FROM service_providers WHERE user_id = $1",
        [userId],
      );

      if (providerResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Provider profile not found",
        });
      }

      const providerId = providerResult.rows[0].id;
      appointments = await appointmentService.getProviderAppointments(
        providerId,
        status,
      );
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid user role",
      });
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    logger.error("Error in getMyAppointmentsHandler:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

/**
 * Get appointments for a specific provider (accessible by anyone)
 * GET /appointments/provider/:providerId
 */
export const getProviderAppointmentsHandler = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { status } = req.query;

    const appointments = await appointmentService.getProviderAppointments(
      parseInt(providerId),
      status,
    );

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    logger.error("Error in getProviderAppointmentsHandler:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch provider appointments",
      error: error.message,
    });
  }
};

/**
 * Cancel an appointment
 * PUT /appointments/:id/cancel
 */
export const cancelAppointmentHandler = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    const appointment = await appointmentService.cancelAppointment(
      appointmentId,
      userId,
      userRole,
    );

    // Send real-time notifications
    notifyAppointmentCancelled(
      {
        id: appointment.id,
        client_id: appointment.client_id,
        provider_user_id: appointment.provider_user_id,
        slot_date: appointment.slot_date,
        start_time: appointment.start_time,
        client: {
          name: appointment.client_name,
          email: appointment.client_email,
        },
        provider: {
          name: appointment.provider_name,
          specialization: appointment.specialization,
        },
      },
      userRole,
    );

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: {
        id: appointment.id,
        status: appointment.status,
        slot_date: appointment.slot_date,
        start_time: appointment.start_time,
        updated_at: appointment.updated_at,
      },
    });
  } catch (error) {
    logger.error("Error in cancelAppointmentHandler:", error);

    if (
      error.message.includes("not found") ||
      error.message.includes("Not authorized") ||
      error.message.includes("already cancelled") ||
      error.message.includes("Cannot cancel")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};

/**
 * Mark appointment as completed (provider only)
 * PUT /appointments/:id/complete
 */
export const completeAppointmentHandler = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const providerUserId = req.user.id;

    // Verify user is a provider
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Only providers can mark appointments as completed",
      });
    }

    const appointment = await appointmentService.completeAppointment(
      appointmentId,
      providerUserId,
    );

    // Send real-time notification
    notifyAppointmentCompleted({
      id: appointment.id,
      client_id: appointment.client_id,
      provider: {
        name: appointment.provider_name,
        specialization: appointment.specialization,
      },
    });

    res.status(200).json({
      success: true,
      message: "Appointment marked as completed",
      data: {
        id: appointment.id,
        status: appointment.status,
        slot_date: appointment.slot_date,
        start_time: appointment.start_time,
        updated_at: appointment.updated_at,
      },
    });
  } catch (error) {
    logger.error("Error in completeAppointmentHandler:", error);

    if (
      error.message.includes("not found") ||
      error.message.includes("Not authorized") ||
      error.message.includes("already") ||
      error.message.includes("Cannot complete")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to complete appointment",
      error: error.message,
    });
  }
};

/**
 * Get appointment by ID
 * GET /appointments/:id
 */
export const getAppointmentByIdHandler = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    const appointment =
      await appointmentService.getAppointmentById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Verify user is authorized to view this appointment
    const isClient = userRole === "client" && appointment.client_id === userId;
    const isProvider =
      userRole === "provider" && appointment.provider_user_id === userId;

    if (!isClient && !isProvider) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this appointment",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    logger.error("Error in getAppointmentByIdHandler:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
      error: error.message,
    });
  }
};
