import { Icon } from "@iconify/react";
import Logo from '../../layouts/full/shared/logo/Logo';

const Home = () => {

    return (
        <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-20 relative w-full break-words">
            <div className="flex flex-col items-center text-center">

                {/* Logo */}
                <div className="mb-6 flex justify-center">
                    <div className="w-56">
                        <Logo />
                    </div>
                </div>

                {/* Título */}
                <h1 className="text-4xl font-bold text-dark mb-6">
                    ¡Bienvenido a Obrador WEB!
                </h1>

                {/* Mensaje extenso */}
                <div className="text-gray-600 text-base leading-relaxed space-y-4 max-w-3xl">
                    <p>
                        Le damos la bienvenida al sistema de gestión del obrador, una plataforma diseñada para centralizar y agilizar los procesos operativos diarios de manera segura y eficiente.
                    </p>
                    <p>
                        Desde este entorno podrá <strong className="text-dark">consultar y registrar el stock</strong>, administrar <strong className="text-dark">movimientos de materiales</strong> y garantizar la trazabilidad de los recursos en todo momento.
                    </p>
                    <p>
                        Además, cuenta con herramientas para exportar información y monitorear datos clave en tiempo real, brindando mayor control y visibilidad sobre cada operación.
                    </p>
                    <p>
                        Ante cualquier inquietud, sugerencia o requerimiento, el equipo de soporte técnico se encuentra a disposición para brindarle la asistencia necesaria.
                    </p>
                </div>

                {/* Contacto */}
                <div className="flex items-center justify-center gap-5 text-sm text-gray-500 mt-12 flex-wrap">
                    <div className="flex items-center gap-2">
                        soporte@emaservicios.com.ar
                    </div>
                    <span className="hidden sm:block w-px h-5 bg-gray-300" />
                    <div className="flex items-center gap-2">
                        +54 11 4730-1902 Interno 294
                    </div>

                </div>

                {/* Copyright */}
                <p className="mt-12 text-xs text-gray-400">
                    Obrador WEB © 2025. Todos los derechos reservados.
                </p>

            </div>
        </div>
    );
};

export default Home;