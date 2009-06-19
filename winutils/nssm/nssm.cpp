#include "nssm.h"

int console;

/* String function */
int str_equiv(const char *a, const char *b) {
  int i;
  for (i = 0; ; i++) {
    if (tolower(b[i]) != tolower(a[i])) return 0;
    if (! a[i]) return 1;
  }
}

/* How to use me correctly */
int usage(int ret) {
  fprintf(stderr, "NSSM: The non-sucking service manager\n");
  fprintf(stderr, "Version %s, %s\n", NSSM_VERSION, NSSM_DATE);
  fprintf(stderr, "Usage: nssm <option> [args]\n\n");
  fprintf(stderr, "To show service installation GUI:\n");
  fprintf(stderr, "   nssm install[cons] [<servicename>]\n");
  fprintf(stderr, "   nssm install2[cons] [<servicename>]\n\n");
  fprintf(stderr, "To install a service without confirmation:\n");
  fprintf(stderr, "   nssm install[cons] <servicename> <program> [<args>]\n\n");
  fprintf(stderr, "To install a service without confirmation (advanced):\n");
  fprintf(stderr, "   nssm install2[cons] <servicename> <displayname> <description> <program> [<args>]\n\n");
  fprintf(stderr, "To show service removal GUI:\n");
  fprintf(stderr, "   nssm remove [<servicename>]\n\n");
  fprintf(stderr, "To remove a service without confirmation:\n");
  fprintf(stderr, "   nssm remove <servicename> confirm\n");
  return(ret);
}

int main(int argc, char **argv) {
  /* Require an argument since users may try to run nssm directly */
  if (argc == 1) exit(usage(1));

  console = 0;

  /* Valid commands are install... or remove */
  if (str_equiv(argv[1], NSSM_INSTALL)) {
    exit(pre_install_service(argc - 2, argv + 2));
  }
  if (str_equiv(argv[1], NSSM_INSTALLCONS)) {
    console = 1;
    exit(pre_install_service(argc - 2, argv + 2));
  }
  if (str_equiv(argv[1], NSSM_INSTALL2)) {
    exit(pre_install2_service(argc - 2, argv + 2));
  }
  if (str_equiv(argv[1], NSSM_INSTALL2CONS)) {
    console = 1;
    exit(pre_install2_service(argc - 2, argv + 2));
  }
  if (str_equiv(argv[1], NSSM_REMOVE)) {
    exit(pre_remove_service(argc - 2, argv + 2));
  }

  /* Undocumented: "run" or "runcons" is used to actually do service stuff */
  if (str_equiv(argv[1], NSSM_RUNCONS)) {
    if (! AllocConsole()) {
      char *message = error_string(GetLastError());
      eventprintf(EVENTLOG_ERROR_TYPE, "AllocConsole() failed: %s", message);
      if (message) LocalFree(message);
      return 100;
    }
    console = 1;
  }
  else if (! str_equiv(argv[1], NSSM_RUN)) exit(usage(2));

  /* Start service magic */
  SERVICE_TABLE_ENTRY table[] = { { NSSM, service_main }, { 0, 0 } };
  if (! StartServiceCtrlDispatcher(table)) {
    char *message = error_string(GetLastError());
    eventprintf(EVENTLOG_ERROR_TYPE, "StartServiceCtrlDispatcher() failed: %s", message);
    if (message) LocalFree(message);
    return 100;
  }

  /* And nothing more to do */
  return 0;
}
