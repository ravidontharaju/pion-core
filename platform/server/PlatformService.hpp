// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2008 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// Pion is free software: you can redistribute it and/or modify it under the
// terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option)
// any later version.
//
// Pion is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for
// more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Pion.  If not, see <http://www.gnu.org/licenses/>.
//

#ifndef __PION_PLATFORMSERVICE_HEADER__
#define __PION_PLATFORMSERVICE_HEADER__

#include <string>
#include <libxml/tree.h>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/net/WebService.hpp>
#include <pion/platform/PlatformPlugin.hpp>


namespace pion {		// begin namespace pion
namespace server {		// begin namespace server (Pion Server)

	
// forward declarations to avoid header dependencies
class PlatformConfig;
	
	
///
/// PlatformService: Pion Platform WebService that supports XML configuration
///
class PION_SERVER_API PlatformService
	: public pion::platform::PlatformPlugin,
	public pion::net::WebService
{
public:

	/// exception thrown if the Platform configuration is missing
	class MissingConfigException : public PionException {
	public:
		MissingConfigException(const std::string& service_id)
			: PionException("Platform service missing configuration: ", service_id) {}
	};

	/// exception thrown if the config file contains a Service without a Server identifier specified
	class ServerIdOfServiceUnspecifiedException : public PionException {
	public:
		ServerIdOfServiceUnspecifiedException(const std::string& service_id)
			: PionException("Service configuration includes a Service without a Server identifier: ", service_id) {}
	};

	/// exception thrown if the config file contains a Server with an empty or missing HTTP resource
	class EmptyServiceResourceException : public PionException {
	public:
		EmptyServiceResourceException(const std::string& service_id)
			: PionException("Service configuration does not define a resource: ", service_id) {}
	};

	
	/// constructs a new PlatformService object
	PlatformService(void) : m_config_ptr(NULL) {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~PlatformService() {}
	
	/**
	 * attempts to handle a new HTTP request
	 *
	 * @param request the new HTTP request to handle
	 * @param tcp_conn the TCP connection that has the new request
	 *
	 * @return true if the request was handled; false if not
	 */
	virtual void operator()(pion::net::HTTPRequestPtr& request,
							pion::net::TCPConnectionPtr& tcp_conn) = 0;

	/**
	 * sets configuration parameters for this plug-in
	 *
	 * @param platform_cfg reference to the platform configuration manager
	 * @param config_ptr pointer to a list of XML nodes containing plug-in
	 *                   configuration parameters
	 */
	virtual void setConfig(const pion::platform::Vocabulary& v,
						   const xmlNodePtr config_ptr);

	inline virtual void setPlatformConfig(PlatformConfig& platform_cfg) {
		m_config_ptr = &platform_cfg;
	}

	inline void setServerId(const std::string& server_id) { m_server_id = server_id; }

	inline std::string getServerId(void) { return m_server_id; }

	/**
	 * this updates the Codecs that are used by this service; it should
	 * be called whenever any Codec's configuration is updated
	 *
	 * @param platform_cfg reference to the platform configuration manager
	 */
	virtual void updateCodecs(PlatformConfig& platform_cfg) {}
	
	/**
	 * this updates the Databases that are used by this service; it should
	 * be called whenever any Database's configuration is updated
	 *
	 * @param platform_cfg reference to the platform configuration manager
	 */
	virtual void updateDatabases(PlatformConfig& platform_cfg) {}

	/**
	 * this updates the Databases that are used by this service; it should
	 * be called whenever any Database's configuration is updated
	 *
	 * @param platform_cfg reference to the platform configuration manager
	 */
	virtual void updateReactors(PlatformConfig& platform_cfg) {}

	
protected:
	
	/// data type for a collection of resource path branches
	typedef std::vector<std::string>	PathBranches;
	
	
	/**
	 * splits path branches out of an HTTP request resource
	 *
	 * @param branches a collection of path branches extracted
	 * @param resource the HTTP request resource to extra path branches from
	 */
	void splitPathBranches(PathBranches& branches, const std::string& resource);
	
	
	/// returns a const reference to the Platform configuration manager
	inline const PlatformConfig& getConfig(void) const {
		if (m_config_ptr == NULL)
			throw MissingConfigException(getId());
		return *m_config_ptr;
	}
	
	/// returns a reference to the Platform configuration manager
	inline PlatformConfig& getConfig(void) {
		if (m_config_ptr == NULL)
			throw MissingConfigException(getId());
		return *m_config_ptr;
	}
	
	
private:
	
	/// pointer to the Platform configuration manager
	PlatformConfig		*m_config_ptr;

	std::string m_server_id;

	/// name of the server (HTTPServer) element for Pion XML config files
	static const std::string		SERVER_ELEMENT_NAME;

	/// name of the HTTP resource element for Pion XML config files
	static const std::string		RESOURCE_ELEMENT_NAME;
};


//
// The following symbols must be defined for any platform service that you would
// like to be able to load dynamically using the ServiceManager.
//
// Make sure that you replace "PlatformService" with the name of your derived
// class. This name must also match the name of the object file (excluding the
// extension).  These symbols must be linked into your service's object file,
// not included in any headers that it may use (declarations are OK in headers
// but not the definitions).
//
// The "pion_create" function is used to create new instances of your service.
// The "pion_destroy" function is used to destroy instances of your service.
//
// extern "C" PlatformService *pion_create_PlatformService(void) {
//		return new PlatformService;
// }
//
// extern "C" void pion_destroy_PlatformService(PlatformService *service_ptr) {
//		delete service_ptr;
// }
//
	
	
}	// end namespace server
}	// end namespace pion

#endif
