
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STOCK_MINIMO = 5;

// Configuración para mostrar notificaciones con la aplicación abierta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Solicitar permisos de notificaciones.
export async function configurarNotificaciones() {
  try {
    // Intentar configurar el canal de Android.
    // En Expo Go puede no estar disponible.
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync(
          'alertas-inventario',
          {
            name: 'Alertas de inventario',
            description: 'Avisos sobre productos con stock bajo',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#8B4A2B',
          }
        );
      } catch (error) {
        console.warn(
          'No se pudo configurar el canal. Se continuará sin canal personalizado.',
          error
        );
      }
    }

    // Consultar permisos actuales.
    const actuales = await Notifications.getPermissionsAsync();

    let permisos = actuales;

    // Solicitar permisos si todavía no están concedidos.
    if (!actuales.granted) {
      permisos = await Notifications.requestPermissionsAsync();
    }

    const autorizado =
      permisos.granted ||
      permisos.ios?.status ===
        Notifications.IosAuthorizationStatus.PROVISIONAL;

    console.log(
      autorizado
        ? 'Permisos de notificaciones concedidos.'
        : 'Permisos de notificaciones no concedidos.'
    );

    return autorizado;

  } catch (error) {
    console.error(
      'Error configurando permisos de notificaciones:',
      error
    );

    return false;
  }
}

// Comprobar el stock y generar alertas.
export async function evaluarStockBajo(productos) {
  try {
    if (!Array.isArray(productos)) return;

    const permisos = await Notifications.getPermissionsAsync();

    if (!permisos.granted) return;

    for (const producto of productos) {
      if (!producto?.id) continue;

      const stock = Number(producto.stock ?? 0);
      const clave = `alerta_stock_${producto.id}`;

      // Si el producto supera el mínimo,
      // permitir una nueva alerta en el futuro.
      if (stock > STOCK_MINIMO) {
        await SecureStore.deleteItemAsync(clave);
        continue;
      }

      // Evitar repetir la alerta.
      const alertaEnviada =
        await SecureStore.getItemAsync(clave);

      if (alertaEnviada) continue;

      // Crear notificación local.
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Alerta de inventario',
          body: `${producto.nombre} tiene stock bajo. Stock actual: ${stock} unidades.`,
          data: {
            productoId: producto.id,
            tipo: 'STOCK_BAJO',
          },
          sound: true,
        },
        trigger: null,
      });

      // Registrar que ya se notificó.
      await SecureStore.setItemAsync(clave, 'enviada');

      console.log(
        `Notificación enviada: ${producto.nombre}`
      );
    }

  } catch (error) {
    console.error(
      'Error evaluando stock:',
      error
    );
  }
}

